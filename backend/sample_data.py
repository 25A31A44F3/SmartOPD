"""
Seed dataset containing fictional patient profiles for SmartOPD demonstration.
All names, ABHA numbers, phone numbers, and clinical scenarios are completely fictional.
"""
from datetime import datetime, timezone, timedelta
import json
from models import Vitals, RedFlagChecklist
from triage_engine import evaluate_triage
from database import get_db_connection, init_db

FICTIONAL_PATIENTS = [
    {
        "name": "Ramesh Kumar",
        "age": 58,
        "gender": "Male",
        "phone": "9848011223",
        "village_city": "Secunderabad",
        "abha_id": "ABHA-9821-4412",
        "chief_complaint": "Severe crushing retrosternal chest pain radiating to left shoulder, sweating profusely",
        "duration": "1.5 hours",
        "department": "Cardiology / Emergency",
        "vitals": Vitals(
            heart_rate=124,
            systolic_bp=182,
            diastolic_bp=108,
            spo2=91.0,
            respiratory_rate=24,
            temperature_f=98.6,
            blood_glucose=146.0,
            pain_score=9
        ),
        "red_flags": RedFlagChecklist(
            severe_chest_pain=True,
            severe_respiratory_distress=False
        ),
        "status": "Waiting",
        "minutes_ago": 18
    },
    {
        "name": "Lakshmi Devi",
        "age": 64,
        "gender": "Female",
        "phone": "9440188734",
        "village_city": "Guntur",
        "abha_id": "ABHA-7123-9901",
        "chief_complaint": "Acute severe shortness of breath, audible wheeze, unable to speak full sentences",
        "duration": "45 minutes",
        "department": "Pulmonology / Emergency",
        "vitals": Vitals(
            heart_rate=132,
            systolic_bp=150,
            diastolic_bp=94,
            spo2=87.0,
            respiratory_rate=32,
            temperature_f=99.2,
            pain_score=7
        ),
        "red_flags": RedFlagChecklist(
            severe_respiratory_distress=True
        ),
        "status": "Waiting",
        "minutes_ago": 12
    },
    {
        "name": "Baby Aarav",
        "age": 1,
        "gender": "Male",
        "phone": "9988776655",
        "village_city": "Rangareddy",
        "abha_id": "ABHA-3321-1200",
        "chief_complaint": "High fever 104°F, lethargic, refusing breastfeeds, twitching movements",
        "duration": "3 hours",
        "department": "Pediatrics",
        "vitals": Vitals(
            heart_rate=146,
            systolic_bp=88,
            diastolic_bp=55,
            spo2=94.0,
            respiratory_rate=36,
            temperature_f=104.1,
            pain_score=8
        ),
        "red_flags": RedFlagChecklist(
            pediatric_danger_signs=True
        ),
        "status": "Waiting",
        "minutes_ago": 8
    },
    {
        "name": "Priya Sharma",
        "age": 27,
        "gender": "Female",
        "phone": "9876543210",
        "village_city": "Warangal",
        "abha_id": "ABHA-5521-8819",
        "chief_complaint": "Severe right lower quadrant abdominal pain with persistent vomiting for 8 hours",
        "duration": "8 hours",
        "department": "General Surgery",
        "vitals": Vitals(
            heart_rate=102,
            systolic_bp=112,
            diastolic_bp=72,
            spo2=98.0,
            respiratory_rate=20,
            temperature_f=100.8,
            pain_score=8
        ),
        "red_flags": RedFlagChecklist(
            severe_acute_abdominal_pain=True,
            persistent_uncontrolled_vomiting=True
        ),
        "status": "Waiting",
        "minutes_ago": 35
    },
    {
        "name": "Venkatesh Rao",
        "age": 72,
        "gender": "Male",
        "phone": "9123456789",
        "village_city": "Vijayawada",
        "abha_id": "ABHA-1102-4433",
        "chief_complaint": "High fever with rigors, neck discomfort, confusion since early morning",
        "duration": "12 hours",
        "department": "General Medicine",
        "vitals": Vitals(
            heart_rate=98,
            systolic_bp=142,
            diastolic_bp=86,
            spo2=95.0,
            respiratory_rate=20,
            temperature_f=102.4,
            pain_score=6
        ),
        "red_flags": RedFlagChecklist(
            high_fever_with_stiff_neck=True
        ),
        "status": "In Consultation",
        "minutes_ago": 45
    },
    {
        "name": "Mohammed Ismail",
        "age": 34,
        "gender": "Male",
        "phone": "9955112233",
        "village_city": "Nizamabad",
        "abha_id": "ABHA-6612-3394",
        "chief_complaint": "Deep cut laceration on right forearm after workshop injury, active bleeding controlled with bandage",
        "duration": "1 hour",
        "department": "Orthopedics / Trauma",
        "vitals": Vitals(
            heart_rate=90,
            systolic_bp=126,
            diastolic_bp=82,
            spo2=98.0,
            respiratory_rate=18,
            temperature_f=98.6,
            pain_score=7
        ),
        "red_flags": RedFlagChecklist(),
        "status": "Waiting",
        "minutes_ago": 28
    },
    {
        "name": "Ananya Das",
        "age": 41,
        "gender": "Female",
        "phone": "9887766112",
        "village_city": "Khammam",
        "abha_id": "ABHA-8842-1133",
        "chief_complaint": "Pounding unilateral migraine with severe photophobia and nausea",
        "duration": "1 day",
        "department": "General Medicine",
        "vitals": Vitals(
            heart_rate=84,
            systolic_bp=134,
            diastolic_bp=88,
            spo2=99.0,
            respiratory_rate=16,
            temperature_f=98.4,
            pain_score=8
        ),
        "red_flags": RedFlagChecklist(),
        "status": "Waiting",
        "minutes_ago": 52
    },
    {
        "name": "K. Srinivas",
        "age": 49,
        "gender": "Male",
        "phone": "9701123456",
        "village_city": "Karimnagar",
        "abha_id": "ABHA-2244-6677",
        "chief_complaint": "Routine blood pressure review and monthly medication refill for amlodipine",
        "duration": "3 months",
        "department": "General Medicine",
        "vitals": Vitals(
            heart_rate=74,
            systolic_bp=126,
            diastolic_bp=80,
            spo2=98.0,
            respiratory_rate=16,
            temperature_f=98.2,
            blood_glucose=118.0,
            pain_score=0
        ),
        "red_flags": RedFlagChecklist(),
        "status": "Completed",
        "minutes_ago": 90
    },
    {
        "name": "Sunita Bai",
        "age": 36,
        "gender": "Female",
        "phone": "9398877112",
        "village_city": "Mahbubnagar",
        "abha_id": "ABHA-9933-2211",
        "chief_complaint": "Mild dry cough, throat itching, and nasal congestion without fever",
        "duration": "4 days",
        "department": "General Medicine",
        "vitals": Vitals(
            heart_rate=72,
            systolic_bp=116,
            diastolic_bp=74,
            spo2=99.0,
            respiratory_rate=15,
            temperature_f=98.6,
            pain_score=1
        ),
        "red_flags": RedFlagChecklist(),
        "status": "Waiting",
        "minutes_ago": 65
    },
    {
        "name": "Chinnaiah Goud",
        "age": 62,
        "gender": "Male",
        "phone": "9490112244",
        "village_city": "Medak",
        "abha_id": "ABHA-4488-5522",
        "chief_complaint": "Bilateral knee joint stiffness and chronic aching on walking, osteoarthritis follow up",
        "duration": "6 months",
        "department": "Orthopedics",
        "vitals": Vitals(
            heart_rate=68,
            systolic_bp=130,
            diastolic_bp=82,
            spo2=97.0,
            respiratory_rate=14,
            temperature_f=98.0,
            pain_score=3
        ),
        "red_flags": RedFlagChecklist(),
        "status": "Waiting",
        "minutes_ago": 75
    },
    {
        "name": "B. Swathi",
        "age": 24,
        "gender": "Female",
        "phone": "9550011223",
        "village_city": "Nalgonda",
        "abha_id": "ABHA-7711-3344",
        "chief_complaint": "Pruritic circular fungal skin rash on forearms and neck",
        "duration": "2 weeks",
        "department": "Dermatology",
        "vitals": Vitals(
            heart_rate=70,
            systolic_bp=112,
            diastolic_bp=70,
            spo2=99.0,
            respiratory_rate=14,
            temperature_f=98.4,
            pain_score=0
        ),
        "red_flags": RedFlagChecklist(),
        "status": "Waiting",
        "minutes_ago": 80
    },
    {
        "name": "Devi Prasad",
        "age": 53,
        "gender": "Male",
        "phone": "9660112233",
        "village_city": "Adilabad",
        "abha_id": "ABHA-1299-8833",
        "chief_complaint": "Type 2 diabetes quarterly review, check fasting sugar, renewal of metformin",
        "duration": "1 year",
        "department": "General Medicine",
        "vitals": Vitals(
            heart_rate=76,
            systolic_bp=124,
            diastolic_bp=80,
            spo2=98.0,
            respiratory_rate=16,
            temperature_f=98.2,
            blood_glucose=138.0,
            pain_score=0
        ),
        "red_flags": RedFlagChecklist(),
        "status": "Completed",
        "minutes_ago": 110
    }
]

def seed_database():
    init_db()
    conn = get_db_connection()
    cursor = conn.cursor()

    # Clear previous seed
    cursor.execute("DELETE FROM patients")
    cursor.execute("DELETE FROM audit_logs")

    now = datetime.now(timezone(timedelta(hours=5, minutes=30)))
    counter = 100

    for item in FICTIONAL_PATIENTS:
        counter += 1
        vitals = item["vitals"]
        red_flags = item["red_flags"]
        triage = evaluate_triage(vitals, red_flags, item["age"], item["chief_complaint"])
        
        # Token format based on priority
        prefix = "EMG" if triage.priority == "Emergency" else ("URG" if triage.priority == "Urgent" else "OPD")
        token_number = f"{prefix}-{counter}"
        
        reg_time = now - timedelta(minutes=item["minutes_ago"])
        reg_time_iso = reg_time.isoformat()
        consult_time_iso = (reg_time + timedelta(minutes=15)).isoformat() if item["status"] == "Completed" else None

        cursor.execute("""
        INSERT INTO patients (
            token_number, name, age, gender, phone, village_city, abha_id,
            chief_complaint, duration, department, vitals_json, red_flags_json,
            triage_json, priority, priority_code, original_priority,
            is_overridden, override_reason, override_by, status,
            assigned_room, registered_at, consulted_at, estimated_wait_minutes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            token_number,
            item["name"],
            item["age"],
            item["gender"],
            item["phone"],
            item["village_city"],
            item["abha_id"],
            item["chief_complaint"],
            item["duration"],
            item["department"],
            json.dumps(vitals.model_dump()),
            json.dumps(red_flags.model_dump()),
            json.dumps(triage.model_dump()),
            triage.priority,
            triage.priority_code,
            triage.priority,
            0,
            None,
            None,
            item["status"],
            triage.suggested_station,
            reg_time_iso,
            consult_time_iso,
            5 if triage.priority == "Emergency" else (20 if triage.priority == "Urgent" else 45)
        ))

    conn.commit()
    conn.close()
    print("Database seeded successfully with fictional demonstration patients.")

if __name__ == "__main__":
    seed_database()
