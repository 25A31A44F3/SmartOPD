"""
SmartOPD - FastAPI Backend Application
Intelligent Patient Triage and Queue Management for Government Hospitals
"""
import os
import json
from datetime import datetime, timezone, timedelta
from typing import Optional, List
from fastapi import FastAPI, HTTPException, Query, status
from fastapi.middleware.cors import CORSMiddleware

from models import (
    PatientCreate, PatientResponse, TriageResult, OverrideRequest,
    StatusUpdateRequest, QueueStats, Vitals, RedFlagChecklist
)
from triage_engine import evaluate_triage
from database import get_db_connection, init_db, log_action
from sample_data import seed_database

from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    conn = get_db_connection()
    count = conn.execute("SELECT COUNT(*) FROM patients").fetchone()[0]
    conn.close()
    if count == 0:
        seed_database()
    yield

app = FastAPI(
    title="SmartOPD - Patient Triage & Queue API",
    description="Intelligent Non-Clinical Triage & Queue Assistant for Overloaded Government Hospitals",
    version="1.0.0",
    lifespan=lifespan
)

# Enable CORS for local Vite dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def parse_patient_row(row) -> PatientResponse:
    vitals_dict = json.loads(row["vitals_json"])
    red_flags_dict = json.loads(row["red_flags_json"])
    triage_dict = json.loads(row["triage_json"])

    return PatientResponse(
        id=row["id"],
        token_number=row["token_number"],
        name=row["name"],
        age=row["age"],
        gender=row["gender"],
        phone=row["phone"],
        village_city=row["village_city"],
        abha_id=row["abha_id"],
        chief_complaint=row["chief_complaint"],
        duration=row["duration"],
        department=row["department"],
        vitals=Vitals(**vitals_dict),
        red_flags=RedFlagChecklist(**red_flags_dict),
        triage=TriageResult(**triage_dict),
        priority=row["priority"],
        priority_code=row["priority_code"],
        original_priority=row["original_priority"],
        is_overridden=bool(row["is_overridden"]),
        override_reason=row["override_reason"],
        override_by=row["override_by"],
        status=row["status"],
        assigned_room=row["assigned_room"],
        registered_at=row["registered_at"],
        consulted_at=row["consulted_at"],
        estimated_wait_minutes=row["estimated_wait_minutes"]
    )

@app.get("/api/health")
def health():
    return {
        "status": "healthy",
        "service": "SmartOPD Intelligent Triage Assistant",
        "timestamp": datetime.now(timezone(timedelta(hours=5, minutes=30))).isoformat()
    }

@app.post("/api/triage/assess", response_model=TriageResult)
def assess_triage(
    vitals: Vitals,
    red_flags: RedFlagChecklist,
    age: int = 30,
    chief_complaint: str = "General assessment"
):
    """
    Real-time provisional triage calculation preview.
    Uses transparent physiological rules without saving to database.
    """
    return evaluate_triage(vitals, red_flags, age, chief_complaint)

@app.post("/api/patients", response_model=PatientResponse, status_code=status.HTTP_201_CREATED)
def register_patient(patient_in: PatientCreate):
    """
    Registers a new patient, computes rule-based triage, assigns a prioritized token,
    and inserts into the queue database.
    """
    triage_res = evaluate_triage(
        patient_in.vitals,
        patient_in.red_flags,
        patient_in.age,
        patient_in.chief_complaint
    )

    conn = get_db_connection()
    cursor = conn.cursor()

    # Generate sequential token
    cursor.execute("SELECT COUNT(*) FROM patients")
    count = cursor.fetchone()[0] + 1
    prefix = "EMG" if triage_res.priority == "Emergency" else ("URG" if triage_res.priority == "Urgent" else "OPD")
    token_number = f"{prefix}-{100 + count}"

    now_iso = datetime.now(timezone(timedelta(hours=5, minutes=30))).isoformat()
    est_wait = 5 if triage_res.priority == "Emergency" else (20 if triage_res.priority == "Urgent" else 45)

    cursor.execute("""
    INSERT INTO patients (
        token_number, name, age, gender, phone, village_city, abha_id,
        chief_complaint, duration, department, vitals_json, red_flags_json,
        triage_json, priority, priority_code, original_priority,
        is_overridden, override_reason, override_by, status,
        assigned_room, registered_at, estimated_wait_minutes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        token_number,
        patient_in.name,
        patient_in.age,
        patient_in.gender,
        patient_in.phone or "",
        patient_in.village_city or "Local",
        patient_in.abha_id or "",
        patient_in.chief_complaint,
        patient_in.duration,
        patient_in.department or "General Medicine",
        json.dumps(patient_in.vitals.model_dump()),
        json.dumps(patient_in.red_flags.model_dump()),
        json.dumps(triage_res.model_dump()),
        triage_res.priority,
        triage_res.priority_code,
        triage_res.priority,
        0,
        None,
        None,
        "Waiting",
        triage_res.suggested_station,
        now_iso,
        est_wait
    ))

    patient_id = cursor.lastrowid
    conn.commit()

    cursor.execute("SELECT * FROM patients WHERE id = ?", (patient_id,))
    row = cursor.fetchone()
    conn.close()

    log_action(
        action="PATIENT_REGISTERED",
        details=f"Patient registered with priority {triage_res.priority} (Score {triage_res.score})",
        patient_id=patient_id,
        token_number=token_number,
        staff_name="Triage Desk 1"
    )

    return parse_patient_row(row)

@app.get("/api/patients", response_model=List[PatientResponse])
def get_patients(
    q: Optional[str] = Query(None, description="Search by name, token, or ABHA ID"),
    department: Optional[str] = Query(None, description="Filter by department"),
    priority: Optional[str] = Query(None, description="Filter by priority: Emergency, Urgent, Routine"),
    status: Optional[str] = Query(None, description="Filter by status: Waiting, In Consultation, Completed")
):
    conn = get_db_connection()
    cursor = conn.cursor()

    query = "SELECT * FROM patients WHERE 1=1"
    params = []

    if q:
        query += " AND (name LIKE ? OR token_number LIKE ? OR abha_id LIKE ? OR phone LIKE ?)"
        term = f"%{q}%"
        params.extend([term, term, term, term])

    if department and department != "All":
        query += " AND department = ?"
        params.append(department)

    if priority and priority != "All":
        query += " AND priority = ?"
        params.append(priority)

    if status and status != "All":
        query += " AND status = ?"
        params.append(status)

    query += " ORDER BY id DESC"
    cursor.execute(query, params)
    rows = cursor.fetchall()
    conn.close()

    return [parse_patient_row(r) for r in rows]

@app.get("/api/queue", response_model=List[PatientResponse])
def get_queue(
    department: Optional[str] = Query(None),
    include_completed: bool = Query(False)
):
    """
    Returns live prioritized patient queue.
    Sorting Order:
    1. Status: Active cases ('In Consultation', 'Waiting') before 'Completed'/'Transferred'.
    2. Priority: Emergency (1) -> Urgent (2) -> Routine (3).
    3. Registration Time: FIFO (Earliest registered gets priority within same tier).
    """
    conn = get_db_connection()
    cursor = conn.cursor()

    query = "SELECT * FROM patients WHERE 1=1"
    params = []

    if not include_completed:
        query += " AND status IN ('Waiting', 'In Consultation')"

    if department and department != "All":
        query += " AND department = ?"
        params.append(department)

    # Custom SQL Order:
    # 1. Status: 'In Consultation' first (0), 'Waiting' second (1), Others (2)
    # 2. Priority: 'Emergency' (1), 'Urgent' (2), 'Routine' (3)
    # 3. registered_at ASC
    query += """
    ORDER BY 
        CASE 
            WHEN status = 'In Consultation' THEN 0
            WHEN status = 'Waiting' THEN 1
            ELSE 2
        END ASC,
        CASE 
            WHEN priority = 'Emergency' THEN 1
            WHEN priority = 'Urgent' THEN 2
            ELSE 3
        END ASC,
        registered_at ASC
    """

    cursor.execute(query, params)
    rows = cursor.fetchall()
    conn.close()

    return [parse_patient_row(r) for r in rows]

@app.get("/api/patients/{patient_id}", response_model=PatientResponse)
def get_patient(patient_id: int):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM patients WHERE id = ?", (patient_id,))
    row = cursor.fetchone()
    conn.close()

    if not row:
        raise HTTPException(status_code=404, detail="Patient not found")
    return parse_patient_row(row)

@app.post("/api/queue/{patient_id}/override", response_model=PatientResponse)
def override_priority(patient_id: int, req: OverrideRequest):
    """
    Allows authorized medical staff to override provisional triage priority.
    Logs staff identity and clinical justification.
    """
    if req.new_priority not in ["Emergency", "Urgent", "Routine"]:
        raise HTTPException(status_code=400, detail="Invalid priority level. Must be Emergency, Urgent, or Routine.")

    priority_code = "RED" if req.new_priority == "Emergency" else ("YELLOW" if req.new_priority == "Urgent" else "GREEN")

    # Update assigned room based on new priority
    new_room = (
        "Resuscitation Bay / Red Zone (Emergency Bay 1)"
        if req.new_priority == "Emergency"
        else ("Yellow Zone Observation / Priority OPD Counter 2" if req.new_priority == "Urgent" else "General OPD Consultation Room")
    )

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM patients WHERE id = ?", (patient_id,))
    row = cursor.fetchone()
    if not row:
        conn.close()
        raise HTTPException(status_code=404, detail="Patient not found")

    old_priority = row["priority"]
    token_number = row["token_number"]

    cursor.execute("""
    UPDATE patients SET
        priority = ?,
        priority_code = ?,
        is_overridden = 1,
        override_reason = ?,
        override_by = ?,
        assigned_room = ?
    WHERE id = ?
    """, (req.new_priority, priority_code, req.reason, req.staff_name, new_room, patient_id))

    conn.commit()

    cursor.execute("SELECT * FROM patients WHERE id = ?", (patient_id,))
    updated_row = cursor.fetchone()
    conn.close()

    log_action(
        action="PRIORITY_OVERRIDE",
        details=f"Overridden from {old_priority} to {req.new_priority}. Reason: {req.reason}",
        patient_id=patient_id,
        token_number=token_number,
        staff_name=req.staff_name
    )

    return parse_patient_row(updated_row)

@app.patch("/api/queue/{patient_id}/status", response_model=PatientResponse)
def update_patient_status(patient_id: int, req: StatusUpdateRequest):
    valid_statuses = ["Waiting", "In Consultation", "Completed", "Transferred"]
    if req.status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Choose from: {valid_statuses}")

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM patients WHERE id = ?", (patient_id,))
    row = cursor.fetchone()
    if not row:
        conn.close()
        raise HTTPException(status_code=404, detail="Patient not found")

    now_iso = datetime.now(timezone(timedelta(hours=5, minutes=30))).isoformat()
    consulted_at = now_iso if req.status == "Completed" else row["consulted_at"]
    assigned_room = req.assigned_room if req.assigned_room else row["assigned_room"]

    cursor.execute("""
    UPDATE patients SET
        status = ?,
        assigned_room = ?,
        consulted_at = ?
    WHERE id = ?
    """, (req.status, assigned_room, consulted_at, patient_id))

    conn.commit()

    cursor.execute("SELECT * FROM patients WHERE id = ?", (patient_id,))
    updated_row = cursor.fetchone()
    conn.close()

    log_action(
        action="STATUS_CHANGED",
        details=f"Status changed to {req.status}",
        patient_id=patient_id,
        token_number=row["token_number"],
        staff_name="OPD Staff"
    )

    return parse_patient_row(updated_row)

@app.get("/api/stats", response_model=QueueStats)
def get_stats():
    conn = get_db_connection()
    cursor = conn.cursor()

    total = cursor.execute("SELECT COUNT(*) FROM patients").fetchone()[0]
    waiting = cursor.execute("SELECT COUNT(*) FROM patients WHERE status = 'Waiting'").fetchone()[0]
    in_consult = cursor.execute("SELECT COUNT(*) FROM patients WHERE status = 'In Consultation'").fetchone()[0]
    completed = cursor.execute("SELECT COUNT(*) FROM patients WHERE status = 'Completed'").fetchone()[0]

    emergency = cursor.execute("SELECT COUNT(*) FROM patients WHERE priority = 'Emergency'").fetchone()[0]
    urgent = cursor.execute("SELECT COUNT(*) FROM patients WHERE priority = 'Urgent'").fetchone()[0]
    routine = cursor.execute("SELECT COUNT(*) FROM patients WHERE priority = 'Routine'").fetchone()[0]

    overridden = cursor.execute("SELECT COUNT(*) FROM patients WHERE is_overridden = 1").fetchone()[0]

    # Department breakdown
    dept_rows = cursor.execute("SELECT department, COUNT(*) as count FROM patients GROUP BY department").fetchall()
    dept_load = {r["department"]: r["count"] for r in dept_rows}

    conn.close()

    # Calculate simulated realistic average wait time based on queue depth
    avg_wait = 12 if total == 0 else min(95, max(8, (waiting * 7) + (emergency * 3)))

    return QueueStats(
        total_patients=total,
        waiting_patients=waiting,
        in_consultation=in_consult,
        completed_patients=completed,
        emergency_cases=emergency,
        urgent_cases=urgent,
        routine_cases=routine,
        overridden_count=overridden,
        avg_wait_time_minutes=avg_wait,
        department_load=dept_load
    )

@app.get("/api/audit-logs")
def get_audit_logs():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM audit_logs ORDER BY id DESC LIMIT 50")
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]

@app.post("/api/reset-seed")
def reset_seed():
    """Resets database and reloads 12 realistic demonstration patient records"""
    seed_database()
    return {"message": "Database successfully reset and re-seeded with realistic demonstration data."}
