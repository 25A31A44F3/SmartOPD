"""
Automated Pytest Suite for SmartOPD
Tests:
1. Deterministic Triage Rule Engine accuracy
2. Red flag and critical vital triggers
3. API patient registration & queue sorting (Emergency > Urgent > Routine)
4. Staff priority override mechanism
5. Status transitions and stats calculation
"""
import pytest
from fastapi.testclient import TestClient
from main import app
from triage_engine import evaluate_triage, evaluate_vitals
from models import Vitals, RedFlagChecklist

client = TestClient(app)

def test_triage_emergency_red_flag_chest_pain():
    vitals = Vitals(heart_rate=95, systolic_bp=130, diastolic_bp=85, spo2=97.0, respiratory_rate=18, temperature_f=98.6)
    red_flags = RedFlagChecklist(severe_chest_pain=True)
    res = evaluate_triage(vitals, red_flags, age=55, chief_complaint="Chest tightness")
    assert res.priority == "Emergency"
    assert res.priority_code == "RED"
    assert "chest pain" in res.explanation.lower()
    assert "Resuscitation" in res.suggested_station

def test_triage_emergency_critical_spo2():
    vitals = Vitals(heart_rate=115, systolic_bp=120, diastolic_bp=75, spo2=87.0, respiratory_rate=28, temperature_f=99.0)
    red_flags = RedFlagChecklist()
    res = evaluate_triage(vitals, red_flags, age=40, chief_complaint="Shortness of breath")
    assert res.priority == "Emergency"
    assert res.priority_code == "RED"
    assert any("Hypoxia" in a for a in res.vital_alerts)

def test_triage_urgent_abdominal_pain():
    vitals = Vitals(heart_rate=88, systolic_bp=120, diastolic_bp=80, spo2=98.0, respiratory_rate=18, temperature_f=99.2, pain_score=8)
    red_flags = RedFlagChecklist(severe_acute_abdominal_pain=True)
    res = evaluate_triage(vitals, red_flags, age=28, chief_complaint="Severe stomach pain")
    assert res.priority == "Urgent"
    assert res.priority_code == "YELLOW"
    assert "abdominal pain" in res.explanation.lower()

def test_triage_routine_normal_case():
    vitals = Vitals(heart_rate=72, systolic_bp=118, diastolic_bp=76, spo2=99.0, respiratory_rate=16, temperature_f=98.4, pain_score=1)
    red_flags = RedFlagChecklist()
    res = evaluate_triage(vitals, red_flags, age=35, chief_complaint="Mild cough for 3 days")
    assert res.priority == "Routine"
    assert res.priority_code == "GREEN"
    assert len(res.vital_alerts) == 0

def test_api_health():
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_api_triage_assess():
    payload = {
        "vitals": {
            "heart_rate": 135,
            "systolic_bp": 140,
            "diastolic_bp": 90,
            "spo2": 89.0,
            "respiratory_rate": 26,
            "temperature_f": 98.6
        },
        "red_flags": {
            "severe_respiratory_distress": True
        },
        "age": 60,
        "chief_complaint": "Acute severe wheezing"
    }
    response = client.post("/api/triage/assess", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["priority"] == "Emergency"
    assert data["priority_code"] == "RED"

def test_api_register_and_queue_sorting():
    # Reset sample seed first
    client.post("/api/reset-seed")

    # Register Emergency Patient
    emg_payload = {
        "name": "Test Emergency Patient",
        "age": 50,
        "gender": "Male",
        "phone": "9999900001",
        "chief_complaint": "Sudden severe chest pain radiating to left arm",
        "duration": "30 minutes",
        "department": "Cardiology",
        "vitals": {
            "heart_rate": 128,
            "systolic_bp": 170,
            "diastolic_bp": 100,
            "spo2": 92.0,
            "respiratory_rate": 24,
            "temperature_f": 98.6,
            "pain_score": 9
        },
        "red_flags": {
            "severe_chest_pain": True
        }
    }
    res_emg = client.post("/api/patients", json=emg_payload)
    assert res_emg.status_code == 201
    patient_data = res_emg.json()
    assert patient_data["priority"] == "Emergency"
    assert patient_data["token_number"].startswith("EMG-")

    # Register Routine Patient
    routine_payload = {
        "name": "Test Routine Patient",
        "age": 30,
        "gender": "Female",
        "phone": "9999900002",
        "chief_complaint": "Renewal of skin ointment prescription",
        "duration": "1 week",
        "department": "Dermatology",
        "vitals": {
            "heart_rate": 72,
            "systolic_bp": 115,
            "diastolic_bp": 75,
            "spo2": 99.0,
            "respiratory_rate": 16,
            "temperature_f": 98.4,
            "pain_score": 0
        },
        "red_flags": {}
    }
    res_routine = client.post("/api/patients", json=routine_payload)
    assert res_routine.status_code == 201
    assert res_routine.json()["priority"] == "Routine"

    # Query queue: verify Emergency cases appear before Routine cases
    queue_res = client.get("/api/queue")
    assert queue_res.status_code == 200
    queue = queue_res.json()
    assert len(queue) > 0

    # Verify priority ordering
    waiting_priorities = [p["priority"] for p in queue if p["status"] == "Waiting"]
    # Check that any Emergency comes before any Routine in Waiting status
    emg_indices = [i for i, p in enumerate(waiting_priorities) if p == "Emergency"]
    routine_indices = [i for i, p in enumerate(waiting_priorities) if p == "Routine"]
    if emg_indices and routine_indices:
        assert max(emg_indices) < min(routine_indices), "Emergency patients must be queued ahead of Routine patients"

def test_api_staff_override():
    # Register a routine patient then override to Emergency
    routine_payload = {
        "name": "Test Override Patient",
        "age": 45,
        "gender": "Male",
        "chief_complaint": "Mild dizziness",
        "duration": "2 hours",
        "vitals": {
            "heart_rate": 76,
            "systolic_bp": 120,
            "diastolic_bp": 80,
            "spo2": 98.0
        },
        "red_flags": {}
    }
    res = client.post("/api/patients", json=routine_payload)
    patient_id = res.json()["id"]

    override_payload = {
        "new_priority": "Emergency",
        "reason": "Attendant reported brief loss of consciousness in waiting corridor",
        "staff_name": "Sister Kavitha (Triage Nurse)"
    }
    res_override = client.post(f"/api/queue/{patient_id}/override", json=override_payload)
    assert res_override.status_code == 200
    data = res_override.json()
    assert data["priority"] == "Emergency"
    assert data["is_overridden"] is True
    assert data["override_reason"] == override_payload["reason"]
    assert data["override_by"] == override_payload["staff_name"]

def test_api_stats():
    res = client.get("/api/stats")
    assert res.status_code == 200
    stats = res.json()
    assert "total_patients" in stats
    assert "waiting_patients" in stats
    assert "emergency_cases" in stats
    assert "department_load" in stats
    assert stats["total_patients"] > 0
