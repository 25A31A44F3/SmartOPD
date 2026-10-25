"""
Transparent Rule-Based Clinical Triage Engine for SmartOPD
Calculates provisional Emergency, Urgent, or Routine priority based on:
1. Physiological vital signs thresholds (NEWS2 / Emergency assessment guidelines)
2. High-risk red flag triggers (Airway, Breathing, Circulation, Disability)
3. Age-specific vulnerability multipliers (Pediatric / Geriatric)
"""
from typing import Tuple, List
from models import Vitals, RedFlagChecklist, TriageResult

def evaluate_vitals(vitals: Vitals) -> Tuple[int, List[str], List[str], bool]:
    """
    Evaluates vital signs against clinical physiological thresholds.
    Returns: (score, alerts_en, alerts_te, has_critical_vital)
    """
    score = 0
    alerts_en = []
    alerts_te = []
    has_critical_vital = False

    # 1. Oxygen Saturation (SpO2)
    if vitals.spo2 is not None:
        if vitals.spo2 < 90.0:
            score += 4
            has_critical_vital = True
            alerts_en.append(f"Critical Hypoxia (SpO2: {vitals.spo2}% < 90%)")
            alerts_te.append(f"తీవ్రమైన శ్వాస లోపం / ఆక్సిజన్ తక్కువ (SpO2: {vitals.spo2}%)")
        elif vitals.spo2 <= 93.0:
            score += 2
            alerts_en.append(f"Sub-optimal Oxygen Saturation (SpO2: {vitals.spo2}%)")
            alerts_te.append(f"తక్కువ ఆక్సిజన్ స్థాయి (SpO2: {vitals.spo2}%)")

    # 2. Heart Rate (Pulse)
    if vitals.heart_rate is not None:
        if vitals.heart_rate >= 130:
            score += 3
            has_critical_vital = True
            alerts_en.append(f"Severe Tachycardia (Heart Rate: {vitals.heart_rate} bpm)")
            alerts_te.append(f"గుండె వేగం ప్రమాదకరంగా ఎక్కువ ({vitals.heart_rate} bpm)")
        elif vitals.heart_rate < 45:
            score += 3
            has_critical_vital = True
            alerts_en.append(f"Severe Bradycardia (Heart Rate: {vitals.heart_rate} bpm)")
            alerts_te.append(f"గుండె వేగం ప్రమాదకరంగా తక్కువ ({vitals.heart_rate} bpm)")
        elif vitals.heart_rate >= 110 or vitals.heart_rate < 55:
            score += 1
            alerts_en.append(f"Abnormal Pulse Rate ({vitals.heart_rate} bpm)")
            alerts_te.append(f"అసహజ గుండె వేగం ({vitals.heart_rate} bpm)")

    # 3. Systolic Blood Pressure
    if vitals.systolic_bp is not None:
        if vitals.systolic_bp < 90:
            score += 3
            has_critical_vital = True
            alerts_en.append(f"Hypotensive Shock / Critical Low BP ({vitals.systolic_bp} mmHg)")
            alerts_te.append(f"తీవ్ర రక్తపోటు క్షీణత / షాక్ లక్షణాలు ({vitals.systolic_bp} mmHg)")
        elif vitals.systolic_bp >= 200:
            score += 3
            has_critical_vital = True
            alerts_en.append(f"Hypertensive Crisis (Systolic BP: {vitals.systolic_bp} mmHg)")
            alerts_te.append(f"తీవ్రమైన రక్తపోటు హెచ్చుతగ్గు ({vitals.systolic_bp} mmHg)")
        elif vitals.systolic_bp < 100 or vitals.systolic_bp >= 170:
            score += 1
            alerts_en.append(f"Borderline Blood Pressure ({vitals.systolic_bp} mmHg)")
            alerts_te.append(f"అసహజ రక్తపోటు ({vitals.systolic_bp} mmHg)")

    # 4. Respiratory Rate
    if vitals.respiratory_rate is not None:
        if vitals.respiratory_rate >= 30:
            score += 3
            has_critical_vital = True
            alerts_en.append(f"Tachypnea / Severe Respiratory Distress ({vitals.respiratory_rate} breaths/min)")
            alerts_te.append(f"అత్యంత వేగవంతమైన శ్వాసక్రియ ({vitals.respiratory_rate}/నిమిషానికి)")
        elif vitals.respiratory_rate <= 8:
            score += 3
            has_critical_vital = True
            alerts_en.append(f"Bradypnea / Respiratory Depression ({vitals.respiratory_rate} breaths/min)")
            alerts_te.append(f"ప్రమాదకరమైన మందగించిన శ్వాస ({vitals.respiratory_rate}/నిమిషానికి)")
        elif vitals.respiratory_rate >= 22:
            score += 1
            alerts_en.append(f"Elevated Respiratory Rate ({vitals.respiratory_rate} breaths/min)")
            alerts_te.append(f"ఎక్కువ శ్వాస వేగం ({vitals.respiratory_rate}/నిమిషానికి)")

    # 5. Temperature
    if vitals.temperature_f is not None:
        if vitals.temperature_f >= 103.5:
            score += 2
            alerts_en.append(f"High Grade Hyperpyrexia ({vitals.temperature_f}°F)")
            alerts_te.append(f"తీవ్రమైన జ్వరం ({vitals.temperature_f}°F)")
        elif vitals.temperature_f < 95.0:
            score += 2
            has_critical_vital = True
            alerts_en.append(f"Hypothermia ({vitals.temperature_f}°F)")
            alerts_te.append(f"శరీర ఉష్ణోగ్రత క్షీణత ({vitals.temperature_f}°F)")
        elif vitals.temperature_f >= 101.0:
            score += 1
            alerts_en.append(f"Elevated Temperature ({vitals.temperature_f}°F)")
            alerts_te.append(f"జ్వరం ({vitals.temperature_f}°F)")

    # 6. Blood Glucose
    if vitals.blood_glucose is not None:
        if vitals.blood_glucose < 55:
            score += 3
            has_critical_vital = True
            alerts_en.append(f"Severe Hypoglycemia ({vitals.blood_glucose} mg/dL)")
            alerts_te.append(f"తీవ్ర రక్తంలో చక్కెర లోపం ({vitals.blood_glucose} mg/dL)")
        elif vitals.blood_glucose >= 350:
            score += 3
            alerts_en.append(f"Severe Hyperglycemia ({vitals.blood_glucose} mg/dL)")
            alerts_te.append(f"తీవ్ర రక్తంలో చక్కెర హెచ్చు ({vitals.blood_glucose} mg/dL)")
        elif vitals.blood_glucose >= 250:
            score += 1
            alerts_en.append(f"Elevated Blood Glucose ({vitals.blood_glucose} mg/dL)")
            alerts_te.append(f"ఎక్కువ చక్కెర స్థాయి ({vitals.blood_glucose} mg/dL)")

    # 7. Pain Score
    if vitals.pain_score is not None:
        if vitals.pain_score >= 8:
            score += 2
            alerts_en.append(f"Severe Pain Score ({vitals.pain_score}/10)")
            alerts_te.append(f"తీవ్రమైన నొప్పి ({vitals.pain_score}/10)")
        elif vitals.pain_score >= 5:
            score += 1

    return score, alerts_en, alerts_te, has_critical_vital


def evaluate_triage(
    vitals: Vitals,
    red_flags: RedFlagChecklist,
    age: int,
    chief_complaint: str
) -> TriageResult:
    """
    Core deterministic evaluation engine for patient triage.
    Synthesizes vitals, red flags, and demographic risk factors.
    """
    vital_score, alerts_en, alerts_te, has_critical_vital = evaluate_vitals(vitals)
    total_score = vital_score

    red_flag_triggers_en = []
    red_flag_triggers_te = []
    has_level1_emergency_flag = False
    has_level2_urgent_flag = False

    # Level 1 Red Flags (Immediate Life-Threatening)
    if red_flags.severe_chest_pain:
        has_level1_emergency_flag = True
        total_score += 5
        red_flag_triggers_en.append("Severe crushing chest pain (suspected ACS / Acute Coronary Syndrome)")
        red_flag_triggers_te.append("తీవ్రమైన గుండె/ఛాతీ నొప్పి (గుండెపోటు అనుమానం)")

    if red_flags.severe_respiratory_distress:
        has_level1_emergency_flag = True
        total_score += 5
        red_flag_triggers_en.append("Acute severe respiratory distress / stridor / air hunger")
        red_flag_triggers_te.append("తీవ్రమైన శ్వాస సమస్య / ఊపిరాడని స్థితి")

    if red_flags.altered_consciousness:
        has_level1_emergency_flag = True
        total_score += 5
        red_flag_triggers_en.append("Altered mental status / Glasgow Coma Scale depression / Unresponsive")
        red_flag_triggers_te.append("స్పృహ కోల్పోవడం లేదా మగత / గందరగోళ స్థితి")

    if red_flags.active_severe_bleeding:
        has_level1_emergency_flag = True
        total_score += 5
        red_flag_triggers_en.append("Uncontrolled active hemorrhage or arterial bleeding")
        red_flag_triggers_te.append("ఆగని తీవ్ర రక్తస్రావం")

    if red_flags.severe_trauma_head_injury:
        has_level1_emergency_flag = True
        total_score += 5
        red_flag_triggers_en.append("Major trauma / High impact head or spinal injury")
        red_flag_triggers_te.append("తీవ్ర గాయం / తల లేదా వెన్ను గాయం")

    if red_flags.acute_stroke_signs:
        has_level1_emergency_flag = True
        total_score += 5
        red_flag_triggers_en.append("Acute stroke signs (FAST: Facial asymmetry, Arm weakness, Speech slurring)")
        red_flag_triggers_te.append("పక్షవాతం లక్షణాలు (ముఖం వంకర, చేతి బలహీనత, మాట తడబాటు)")

    if red_flags.pediatric_danger_signs:
        has_level1_emergency_flag = True
        total_score += 5
        red_flag_triggers_en.append("WHO Pediatric Danger Sign (unable to feed, lethargy, convulsions)")
        red_flag_triggers_te.append("పిల్లల ప్రమాదకర లక్షణాలు (పాలు తాగలేకపోవడం, మగత, ఫిట్స్)")

    if red_flags.anaphylaxis_signs:
        has_level1_emergency_flag = True
        total_score += 5
        red_flag_triggers_en.append("Signs of anaphylaxis / acute airway angioedema")
        red_flag_triggers_te.append("తీవ్ర అలెర్జీ / పెదవులు గొంతు వాపు")

    # Level 2 Red Flags (Urgent / High-Risk Deterioration)
    if red_flags.high_fever_with_stiff_neck:
        has_level2_urgent_flag = True
        total_score += 3
        red_flag_triggers_en.append("High fever with neck stiffness / Meningeal irritation signs")
        red_flag_triggers_te.append("మెడ పట్టేసినట్లు ఉండే తీవ్ర జ్వరం")

    if red_flags.severe_acute_abdominal_pain:
        has_level2_urgent_flag = True
        total_score += 3
        red_flag_triggers_en.append("Severe acute abdominal pain / peritoneal signs")
        red_flag_triggers_te.append("తీవ్రమైన కడుపు నొప్పి")

    if red_flags.persistent_uncontrolled_vomiting:
        has_level2_urgent_flag = True
        total_score += 3
        red_flag_triggers_en.append("Persistent vomiting with severe clinical dehydration")
        red_flag_triggers_te.append("తీవ్రమైన వాంతులు మరియు నిర్జలీకరణం")

    # Pediatric / Geriatric Vulnerability Bump
    if (age <= 2 or age >= 75) and total_score >= 2:
        total_score += 1
        red_flag_triggers_en.append(f"Age-related high vulnerability modifier (Age: {age} yrs)")
        red_flag_triggers_te.append(f"వయస్సు పరమైన సున్నితత్వం (వయస్సు: {age} సం.)")

    # Final Categorization
    # Emergency: Must have Level 1 red flag, or critical vital (e.g. SpO2 < 90, SBP < 90), or multi-system composite score >= 6
    if has_level1_emergency_flag or has_critical_vital or total_score >= 6:
        priority = "Emergency"
        priority_code = "RED"
        priority_te = "అత్యవసరము"
        suggested_station = "Resuscitation Bay / Red Zone (Emergency Bay 1)"
        suggested_station_te = "ఎమర్జెన్సీ రెస్క్యూ బే 1 / తక్షణ అత్యవసర విభాగం"
    elif has_level2_urgent_flag or (vitals.pain_score and vitals.pain_score >= 7) or total_score >= 2:
        priority = "Urgent"
        priority_code = "YELLOW"
        priority_te = "తక్షణము"
        suggested_station = "Yellow Zone Observation / Priority OPD Counter 2"
        suggested_station_te = "పసుపు జోన్ అబ్జర్వేషన్ / ప్రాధాన్యత కౌంటర్ 2"
    else:
        priority = "Routine"
        priority_code = "GREEN"
        priority_te = "సాధారణము"
        suggested_station = "General OPD Consultation Room (Rooms 3-6)"
        suggested_station_te = "సాధారణ ఓపీడీ గది (గదులు 3-6)"

    # Build Transparent Explanations
    en_reasons = []
    te_reasons = []

    if red_flag_triggers_en:
        en_reasons.append("Red-flag symptoms: " + "; ".join(red_flag_triggers_en))
        te_reasons.append("ప్రమాద సంకేతాలు: " + "; ".join(red_flag_triggers_te))
    if alerts_en:
        en_reasons.append("Vital sign alerts: " + "; ".join(alerts_en))
        te_reasons.append("వైటల్ సంకేతాల హెచ్చరిక: " + "; ".join(alerts_te))

    if not en_reasons:
        explanation_en = f"No red flags detected. Vital signs are within acceptable baseline limits. Assigned to routine queue for '{chief_complaint}'."
        explanation_te = f"ఎలాంటి అత్యవసర ప్రమాద సంకేతాలు లేవు. వైటల్స్ సాధారణ పరిధిలో ఉన్నాయి. '{chief_complaint}' కొరకు సాధారణ ఓపీడీ క్యూ కేటాయించబడింది."
    else:
        explanation_en = f"Classified as {priority.upper()} (Risk Score: {total_score}/15). Triggers: " + " | ".join(en_reasons)
        explanation_te = f"{priority_te} కేటగిరీగా గుర్తించబడింది (రిస్క్ స్కోరు: {total_score}/15). కారణాలు: " + " | ".join(te_reasons)

    return TriageResult(
        priority=priority,
        priority_code=priority_code,
        priority_te=priority_te,
        score=total_score,
        vital_alerts=alerts_en,
        risk_factors=red_flag_triggers_en,
        suggested_station=suggested_station,
        suggested_station_te=suggested_station_te,
        explanation=explanation_en,
        explanation_te=explanation_te
    )
