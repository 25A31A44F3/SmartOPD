"""
SQLite Database layer for SmartOPD
Stores patients, triage evaluations, queue states, and staff overrides.
"""
import sqlite3
import json
import os
from typing import List, Optional, Dict, Any
from datetime import datetime, timezone, timedelta

DB_PATH = os.path.join(os.path.dirname(__file__), "smart_opd.db")

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS patients (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        token_number TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        age INTEGER NOT NULL,
        gender TEXT NOT NULL,
        phone TEXT,
        village_city TEXT,
        abha_id TEXT,
        chief_complaint TEXT NOT NULL,
        duration TEXT NOT NULL,
        department TEXT NOT NULL,
        vitals_json TEXT NOT NULL,
        red_flags_json TEXT NOT NULL,
        triage_json TEXT NOT NULL,
        priority TEXT NOT NULL,
        priority_code TEXT NOT NULL,
        original_priority TEXT NOT NULL,
        is_overridden INTEGER DEFAULT 0,
        override_reason TEXT,
        override_by TEXT,
        status TEXT NOT NULL DEFAULT 'Waiting',
        assigned_room TEXT NOT NULL,
        registered_at TEXT NOT NULL,
        consulted_at TEXT,
        estimated_wait_minutes INTEGER DEFAULT 15
    )
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS audit_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        patient_id INTEGER,
        token_number TEXT,
        action TEXT NOT NULL,
        details TEXT NOT NULL,
        staff_name TEXT,
        timestamp TEXT NOT NULL,
        FOREIGN KEY (patient_id) REFERENCES patients(id)
    )
    """)

    conn.commit()
    conn.close()

def log_action(action: str, details: str, patient_id: Optional[int] = None, token_number: Optional[str] = None, staff_name: Optional[str] = "System"):
    conn = get_db_connection()
    cursor = conn.cursor()
    now_iso = datetime.now(timezone(timedelta(hours=5, minutes=30))).isoformat()
    cursor.execute(
        "INSERT INTO audit_logs (patient_id, token_number, action, details, staff_name, timestamp) VALUES (?, ?, ?, ?, ?, ?)",
        (patient_id, token_number, action, details, staff_name, now_iso)
    )
    conn.commit()
    conn.close()
