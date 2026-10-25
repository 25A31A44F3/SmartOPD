"""
Pydantic data models for SmartOPD Intelligent Patient Triage System
"""
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class Vitals(BaseModel):
    heart_rate: Optional[int] = Field(None, description="Heart rate in beats per minute (Normal: 60-100)")
    systolic_bp: Optional[int] = Field(None, description="Systolic Blood Pressure in mmHg (Normal: 90-120)")
    diastolic_bp: Optional[int] = Field(None, description="Diastolic Blood Pressure in mmHg (Normal: 60-80)")
    spo2: Optional[float] = Field(None, description="Oxygen Saturation percentage (Normal: 95-100%)")
    respiratory_rate: Optional[int] = Field(None, description="Respiratory rate in breaths per min (Normal: 12-20)")
    temperature_f: Optional[float] = Field(None, description="Body Temperature in Fahrenheit (Normal: 97.5-99.0)")
    blood_glucose: Optional[float] = Field(None, description="Random Blood Glucose in mg/dL (Normal: 70-140)")
    pain_score: Optional[int] = Field(0, ge=0, le=10, description="Pain score from 0 (none) to 10 (worst imaginable)")

class RedFlagChecklist(BaseModel):
    severe_chest_pain: bool = Field(False, description="Severe crushing chest pain, diaphoresis, radiation to jaw/arm")
    severe_respiratory_distress: bool = Field(False, description="Stridor, gasping, unable to speak full sentences, cyanosis")
    altered_consciousness: bool = Field(False, description="Unresponsive, GCS < 15, acute confusion, drowsiness")
    active_severe_bleeding: bool = Field(False, description="Arterial spurting or major uncontrolled hemorrhage")
    severe_trauma_head_injury: bool = Field(False, description="High-speed collision, fall from height, penetrative wound")
    acute_stroke_signs: bool = Field(False, description="FAST signs: Sudden facial droop, arm weakness, speech slurring")
    pediatric_danger_signs: bool = Field(False, description="Infant unable to feed, persistent vomiting, lethargy, convulsions")
    high_fever_with_stiff_neck: bool = Field(False, description="Meningismus, photophobia, non-blanching purpuric rash")
    severe_acute_abdominal_pain: bool = Field(False, description="Board-like rigid abdomen, suspected peritonitis or acute abdomen")
    persistent_uncontrolled_vomiting: bool = Field(False, description="Severe signs of dehydration, sunken fontanelle/eyes")
    anaphylaxis_signs: bool = Field(False, description="Sudden urticaria, angioedema of tongue/lips, audible wheeze")

class PatientCreate(BaseModel):
    name: str = Field(..., min_length=2, description="Patient full name")
    age: int = Field(..., ge=0, le=125, description="Patient age in years")
    gender: str = Field(..., description="Gender: Male, Female, or Other")
    phone: Optional[str] = Field("", description="Contact phone number (10-digit Indian mobile)")
    village_city: Optional[str] = Field("Local", description="Mandal / Village / District")
    abha_id: Optional[str] = Field("", description="ABHA ID or Government Hospital MRN")
    chief_complaint: str = Field(..., min_length=3, description="Presenting complaint or symptom")
    duration: str = Field(..., description="Duration of symptoms (e.g. 2 hours, 3 days)")
    department: Optional[str] = Field("General Medicine", description="OPD Department")
    vitals: Vitals = Field(default_factory=Vitals)
    red_flags: RedFlagChecklist = Field(default_factory=RedFlagChecklist)

class TriageResult(BaseModel):
    priority: str = Field(..., description="Emergency, Urgent, or Routine")
    priority_code: str = Field(..., description="RED, YELLOW, or GREEN")
    priority_te: str = Field(..., description="Telugu translation of priority")
    score: int = Field(..., description="Computed numerical risk score (0-15)")
    vital_alerts: List[str] = Field(default_factory=list, description="Specific vital sign alert messages")
    risk_factors: List[str] = Field(default_factory=list, description="Red flag triggers identified")
    suggested_station: str = Field(..., description="Target room or resuscitation bay")
    suggested_station_te: str = Field(..., description="Telugu translation of station")
    explanation: str = Field(..., description="Transparent clinical rule justification")
    explanation_te: str = Field(..., description="Telugu translation of justification")
    disclaimer: str = Field(
        "DEMONSTRATION PROTOTYPE ONLY: This assessment is non-clinical and rule-based for triage queue demonstration. All priority assignments MUST be verified by authorized medical staff before clinical intervention.",
        description="Mandatory verification disclaimer"
    )

class PatientResponse(BaseModel):
    id: int
    token_number: str
    name: str
    age: int
    gender: str
    phone: Optional[str]
    village_city: Optional[str]
    abha_id: Optional[str]
    chief_complaint: str
    duration: str
    department: str
    vitals: Vitals
    red_flags: RedFlagChecklist
    triage: TriageResult
    priority: str
    priority_code: str
    original_priority: str
    is_overridden: bool
    override_reason: Optional[str]
    override_by: Optional[str]
    status: str  # Waiting, In Consultation, Completed, Transferred
    assigned_room: str
    registered_at: str
    consulted_at: Optional[str] = None
    estimated_wait_minutes: int

class OverrideRequest(BaseModel):
    new_priority: str = Field(..., description="New priority: Emergency, Urgent, or Routine")
    reason: str = Field(..., min_length=5, description="Clinical justification for override")
    staff_name: str = Field(..., min_length=2, description="Staff member name and role (e.g., Sister Radhika, Triage RN)")

class StatusUpdateRequest(BaseModel):
    status: str = Field(..., description="New status: Waiting, In Consultation, Completed, Transferred")
    assigned_room: Optional[str] = None

class QueueStats(BaseModel):
    total_patients: int
    waiting_patients: int
    in_consultation: int
    completed_patients: int
    emergency_cases: int
    urgent_cases: int
    routine_cases: int
    overridden_count: int
    avg_wait_time_minutes: int
    department_load: dict
