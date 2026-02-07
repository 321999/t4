from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import uuid

app = FastAPI(title="Call Center Analytics API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SESSIONS = {}

def normalize_columns(df: pd.DataFrame):
    df.columns = (
        df.columns
        .str.strip()
        .str.lower()
        .str.replace(" ", "_")
    )
    return df

def time_to_seconds(t):
    if pd.isna(t):
        return 0
    h, m, s = map(int, str(t).split(":"))
    return h * 3600 + m * 60 + s


@app.post("/api/upload")
async def upload_csv(file: UploadFile = File(...)):
    print("file loaded *************************************************")
    try:
        df = pd.read_csv(file.file)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid CSV")

    df = normalize_columns(df)

    required = [
        "agent_name",
        "call_start_time",
        "connectstatus",
        "main_desposition",
        "talk_duration"
    ]

    for col in required:
        if col not in df.columns:
            raise HTTPException(status_code=400, detail=f"Missing column: {col}")

    # df["agent_name"] = df["agent_name"].fillna("Unassigned")

    df.loc[df["agent_name"].str.strip() == "", "agent_name"] = "Unassigned"
# asishgned the batch id as well 

# batch id already hi exits then  dont no what to do with this 
    df["call_start_time"] = pd.to_datetime(
        df["call_start_time"],
        format="%d-%m-%Y %H:%M",
        errors="coerce"
    )

    df.dropna(subset=["call_start_time"], inplace=True)
    df["main_desposition"] = (
    df["main_desposition"]
    .str.strip()
    .str.upper()
)

# print(df.columns)

    df["talk_duration_sec"] = df["talk_duration"].apply(time_to_seconds)  
    df["hold_duration_sec"] = df["hold_duration"].apply(time_to_seconds)  
    df["wrapup_duration_sec"] = df["wrapup_duration"].apply(time_to_seconds)  
    df["ring_duration_sec"] = df["ring_duration"].apply(time_to_seconds) 


    print("*"*100)
    # print(df["ring_duration_sec"])


    # df["agent_name"] = df["agent_name"].fillna("Unassigned")
    # df.loc[df["agent_name"].str.strip() == "", "agent_name"] = "Unassigned"

    # df["call_start_time"] = pd.to_datetime(
    #     df["call_start_time"],
    #     format="%d-%m-%Y %H:%M",
    #     errors="coerce"
    # )

    # df.dropna(subset=["call_start_time"], inplace=True)

    # df["talk_duration_sec"] = df["talk_duration"].apply(time_to_seconds)

    session_id = str(uuid.uuid4())
    SESSIONS[session_id] = df

    return {"session_id": session_id, "rows": len(df)}


@app.get("/api/dashboard-stats")
def dashboard_stats(session_id: str):
    if session_id not in SESSIONS:
        raise HTTPException(status_code=404, detail="Invalid session")

    df = SESSIONS[session_id]

    # ---------- SAFETY ----------
    total_calls = len(df)
    if total_calls == 0:
        return {
            "kpis": {},
            "agentPerformance": [],
            "dispositions": [],
            "dailyTrend": [],
        }
  # ---------- ANSWERED ----------
    answered_df = df[df["connectstatus"].str.strip().str.lower().isin(["connected", "answered"])]

# df[df["connectstatus"].str.contains("CONNECTED|ANSWER", case=False, na=False)]
# print("answered df", answered_df)
    answered_df.head(1)
    answered_calls = len(answered_df)
    not_answered = total_calls - answered_calls


    # ---------- RATES ----------
    answer_rate = (answered_calls / total_calls) * 100
    abandonment_rate = 100 - answer_rate

#     # ---------- DURATIONS (seconds) ----------
    avg_talk = answered_df["talk_duration_sec"].mean() or 0
# print(answered_df["talk_duration"].head())
# print(df.columns)
    avg_hold = answered_df["hold_duration_sec"].mean() or 0
    avg_wrap = answered_df["wrapup_duration_sec"].mean() or 0

    avg_aht = avg_talk + avg_hold + avg_wrap

#     # ---------- SERVICE LEVEL ----------
    # df["ring_duration"] = df["ring_duration"].apply(time_to_seconds)
    SLA_SECONDS = 20
    answered_in_sla = answered_df[
        answered_df["ring_duration_sec"] <= SLA_SECONDS
    ]
    service_level = (
        len(answered_in_sla) / answered_calls * 100
        if answered_calls else 0
    )

    # print(df["ring_duration"].min(),df["ring_duration"].max(),df["ring_duration"].mean())
    avg_ring = df["ring_duration_sec"].mean() or 0
    print("yhan tak sab normal hai")
    # ---------- KPIs ----------
    kpis = {
        "totalCalls": total_calls,
        "answeredCalls": answered_calls,
        "notAnswered": not_answered,
        "answerRate": round(answer_rate, 1),
        "abandonmentRate": round(abandonment_rate, 1),
        "avgAHT": round(avg_aht / 60, 1),
        "avgTalkTime": round(avg_talk / 60, 1),
        # "avgHold_in_minute":avg_hold,
        "avgHoldTime": round(avg_hold / 60, 1),
        "avgWrapupTime": round(avg_wrap / 60, 1),
        "serviceLevel": round(service_level, 1),
        "avgRingTime": round(avg_ring / 60, 1),
    }
    print("*"*100)
    print("kpis", kpis)
    for i in kpis:
        print(i, kpis[i])
    
    
    # ---------- AGENT PERFORMANCE ----------
    # agentPerformance = (
    #     df.groupby("agent_name")
    #     .agg(
    #         totalCalls=("agent_name", "count"),
    #         answeredCalls=("connectstatus", lambda x: (x == "Connected").sum()),
    #         avgAHT=("talk_duration_sec", lambda x: (x[x > 0].mean() or 0) / 60),
    #     )
    #     .reset_index()
    #     .fillna(0)
    #     .to_dict(orient="records")
    # )
    agentPerformance = (
    df.assign(
        is_answered=df["connectstatus"]
        .str.strip()
        .str.lower()
        .isin(["connected", "answered"])
    )
    .groupby("agent_name")
    .agg(
        totalCalls=("agent_name", "count"),
        answeredCalls=("is_answered", "sum"),
        avgAHT=(
            "talk_duration_sec",
            lambda x: (
                (
                    x
                    + df.loc[x.index, "hold_duration_sec"]
                    + df.loc[x.index, "wrapup_duration_sec"]
                )[df.loc[x.index, "connectstatus"]
                 .str.strip()
                 .str.lower()
                 .isin(["connected", "answered"])
                ].mean()
                or 0
            ) / 60
        ),
    )
    .reset_index()
    .fillna(0)
    .to_dict(orient="records")
)
    print("yaha pe agent perofrmance khatam hi "*5)

    # ---------- DISPOSITIONS ----------
    # dispositions = (
    #     df["main_desposition"]
    #     .value_counts()
    #     .reset_index()
    #     .rename(columns={"index": "name", "main_desposition": "value"})
    #     .to_dict(orient="records")
    # )
    dispositions = (
    df.loc[
        df["connectstatus"]
        .str.strip()
        .str.lower()
        .isin(["connected", "answered"]),
        "main_desposition"
    ]
    .fillna("Unknown")
    .value_counts()
    .reset_index()
    .rename(columns={
        "index": "name",
        "main_desposition": "value"
    })
    .to_dict(orient="records")
)

    print("yaha pe disposition khatam hi "*5)
#     # ---------- DAILY TREND ----------
    dailyTrend = (
        df.assign(
        date=df["call_start_time"].dt.date,
        is_answered=df["connectstatus"]
        .str.strip()
        .str.lower()
        .isin(["connected", "answered"])
    )
    .groupby("date")
    .agg(
        totalCalls=("date", "count"),
        answeredCalls=("is_answered", "sum"),
    )
    .reset_index()
    )

    dailyTrend["totalCalls"] = dailyTrend["totalCalls"].astype(int)
    dailyTrend["answeredCalls"] = dailyTrend["answeredCalls"].astype(int)

    dailyTrend["answerRate"] = (
    dailyTrend["answeredCalls"] / dailyTrend["totalCalls"] * 100
    ).round(1).astype(float)

    dailyTrend["date"] = dailyTrend["date"].astype(str)

    dailyTrend = dailyTrend.to_dict(orient="records")
    
    print("dailyTrend"*10)
    for i in dailyTrend:
        print(i)
    service_df = df["service"].value_counts().reset_index()
    service_df.columns=["name","value"]
    service_df["value"] = service_df["value"].astype(int)  # convert to Python int
    service_df = service_df.to_dict(orient="records")
    print("service df"*10)
    print(service_df)
    # print)
    # dailyTrend = (
    #     df.assign(date=df["call_start_time"].dt.date)
    #     .groupby("date")
    #     .size()
    #     .reset_index(name="calls")
    #     .to_dict(orient="records")
    # )
    print("#######"*10)
    # To create the heatmap 
    # ---------- EXTRACT DATE & HOUR ----------
    df["date"] = df["call_start_time"].dt.strftime("%d-%m")
    df["hour"] = df["call_start_time"].dt.hour.astype(str).str.zfill(2)
    grouped = (
        df.groupby(["date", "hour"])
        .size()
        .reset_index(name="count")
    )

    # ---------- ENSURE ALL HOURS (00–23) ----------
    unique_dates = sorted(df["date"].unique())
    all_hours = [str(h).zfill(2) for h in range(24)]

    full_index = pd.MultiIndex.from_product(
        [unique_dates, all_hours],
        names=["date", "hour"]
    )
    grouped = (
        grouped
        .set_index(["date", "hour"])
        .reindex(full_index, fill_value=0)
        .reset_index()
    )
    # ---------- FINAL FORMAT ----------
    grouped["hour"] = grouped["hour"] + ":00"
    grouped["count"] = grouped["count"].astype(int)
    grouped=grouped.to_dict(orient="records")
    print(grouped)
    # print("agentPerformance", agentPerformance)
    return {
        "kpis": kpis,
        "agentPerformance": agentPerformance,
        "dispositions": dispositions,
        "dailyTrend": dailyTrend,
        "Services":service_df
        ,"grouped":grouped
    }

# per day ke bases pe hour wise kitna connect hua hi and kitna not connected hi 
# so that i can ha
@app.get("/api/daily-hourly-connect-status")
def daily_hourly_connect_status(session_id: str):
    print("-------------------------------0"*5)
    if session_id not in SESSIONS:
        raise HTTPException(status_code=404, detail="Invalid session")

    df = SESSIONS[session_id].copy()
    # --------------------------------
    # DATE & HOUR EXTRACTION
    # --------------------------------
    df["date"] = df["call_start_time"].dt.strftime("%d-%m")
    df["hour"] = df["call_start_time"].dt.strftime("%H:00")

    # --------------------------------
    # CONNECTED FLAG (NO is_answered COLUMN)
    # --------------------------------
    df["is_connected"] = (
        df["connectstatus"]
        .astype(str)
        .str.strip()
        .str.lower()
        .isin(["connected", "answered"])
    )

    # --------------------------------
    # GROUP BY DATE + HOUR
    # --------------------------------
    hourly = (
        df.groupby(["date", "hour"])
        .agg(
            total=("connectstatus", "count"),
            connected=("is_connected", "sum")
        )
        .reset_index()
    )

    # --------------------------------
    # DERIVED METRIC
    # --------------------------------
    hourly["notConnected"] = hourly["total"] - hourly["connected"]

    # --------------------------------
    # TYPE SAFETY (JSON SERIALIZATION FIX)
    # --------------------------------
    hourly["total"] = hourly["total"].astype(int)
    hourly["connected"] = hourly["connected"].astype(int)
    hourly["notConnected"] = hourly["notConnected"].astype(int)

    # --------------------------------
    # SORT FOR CHARTS
    # --------------------------------
    hourly = hourly.sort_values(["date", "hour"])
    hourly=hourly.to_dict(orient="records")
    print(hourly)

    return hourly 



"""
def normalize_columns(df):
    df.columns = (
        df.columns
        .str.strip()
        .str.lower()
        .str.replace(" ", "_")
    )
    return df
def time_to_seconds(t):
    if pd.isna(t):
        return 0
    h, m, s = map(int, str(t).split(":"))
    return h * 3600 + m * 60 + s

# this is what we require
required = [
        "agent_name",
        "call_start_time",
        "connectstatus",
        "main_desposition",
        "talk_duration"
    ]

# convert all columns in lowercase and replace spaces with underscores
normalize_columns(df)

# print(df.isnull().sum())
df["agent_name"] = df["agent_name"].fillna("Unassigned")

df.loc[df["agent_name"].str.strip() == "", "agent_name"] = "Unassigned"
# asishgned the batch id as well 

# batch id already hi exits then  dont no what to do with this 
df["call_start_time"] = pd.to_datetime(
        df["call_start_time"],
        format="%d-%m-%Y %H:%M",
        errors="coerce"
    )

df.dropna(subset=["call_start_time"], inplace=True)
# print(df.columns)

df["talk_duration_sec"] = df["talk_duration"].apply(time_to_seconds)  
df["hold_duration_sec"] = df["hold_duration"].apply(time_to_seconds)  
df["wrapup_duration_sec"] = df["wrapup_duration"].apply(time_to_seconds)  
df["ring_duration_sec"] = df["ring_duration"].apply(time_to_seconds)  
# df["talk_duration_sec"] = df["talk_duration"].apply(time_to_seconds)  


total_calls = len(df)

# print("total calls", total_calls)
# if total_calls == 0:
#     return {
#         "kpis": {},
#         "agentPerformance": [],
#          "dispositions": [],
#         "dailyTrend": [],
#         }

#     # ---------- ANSWERED ----------
# answered_df = df[df["connectstatus"].str.contains("CONNECTED|ANSWER", case=False, na=False)]
answered_df = df[df["connectstatus"].str.strip().str.lower().isin(["connected", "answered"])]

# df[df["connectstatus"].str.contains("CONNECTED|ANSWER", case=False, na=False)]
# print("answered df", answered_df)
answered_df.head(1)
answered_calls = len(answered_df)
not_answered = total_calls - answered_calls


    # ---------- RATES ----------
answer_rate = (answered_calls / total_calls) * 100
abandonment_rate = 100 - answer_rate

#     # ---------- DURATIONS (seconds) ----------
avg_talk = answered_df["talk_duration_sec"].mean() or 0
# print(answered_df["talk_duration"].head())
# print(df.columns)
avg_hold = answered_df["hold_duration_sec"].mean() or 0
avg_wrap = answered_df["wrapup_duration_sec"].mean() or 0

avg_aht = avg_talk + avg_hold + avg_wrap

#     # ---------- SERVICE LEVEL ----------
df["ring_duration"] = df["ring_duration"].apply(time_to_seconds)
SLA_SECONDS = 20
answered_in_sla = answered_df[
        answered_df["ring_duration_sec"] <= SLA_SECONDS
    ]

"""






# @app.get("/api/dashboard-stats")
# def dashboard_stats(session_id: str):
#     print("get dat fetched********************************************************")
#     if session_id not in SESSIONS:
#         raise HTTPException(status_code=404, detail="Invalid session")

#     df = SESSIONS[session_id]

#     answered_df = len(df[df["connectstatus"] == "Connected"])
#     totalcall = len(df)
#     avgAHT = round(df[df["talk_duration_sec"] > 0]["talk_duration_sec"].mean() / 60, 1)
#     kpis = {
        
#         "totalCalls": len(df),
#         "answeredCalls": answered_df,
#         "answerRate": round(answered_df / totalcall * 100, 1),
#         "avgAHT": avgAHT
#     }

#     agentPerformance = (
#         df.groupby("agent_name")
#         .agg(
#             totalCalls=("agent_name", "count"),
#             answeredCalls=("connectstatus", lambda x: (x == "Connected").sum()),
#             avgAHT=("talk_duration_sec", lambda x: x[x > 0].mean() / 60)
#         )
#         .reset_index()
#         .fillna(0)
#         .to_dict(orient="records")
#     )

#     dispositions = (
#         df["main_desposition"]
#         .value_counts()
#         .reset_index()
#         .rename(columns={"index": "name", "main_desposition": "value"})
#         .to_dict(orient="records")
#     )

#     dailyTrend = (
#         df.assign(date=df["call_start_time"].dt.date)
#         .groupby("date")
#         .size()
#         .reset_index(name="calls")
#         .to_dict(orient="records")
#     )
#     print(kpis,agentPerformance,dispositions,dailyTrend)

#     return {
#         "kpis": kpis,
#         "agentPerformance": agentPerformance,
#         "dispositions": dispositions,
#         "dailyTrend": dailyTrend
#     }












# //////////////////////////////////////////////////////////////////////


# from fastapi import FastAPI, File, UploadFile, HTTPException
# from fastapi.middleware.cors import CORSMiddleware
# from fastapi.responses import JSONResponse
# import pandas as pd
# import numpy as np
# from datetime import datetime, timedelta
# import io
# import json
# from typing import Optional, List, Dict
# from pydantic import BaseModel
# import sqlite3
# from pathlib import Path

# app = FastAPI(title="Call Center Analytics API")

# # CORS Configuration
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["http://localhost:5173"],  # In production, specify your frontend URL
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# # Database setup
# DB_PATH = Path("call_center.db")

# def init_database():
#     """Initialize SQLite database"""
#     conn = sqlite3.connect(DB_PATH)
#     cursor = conn.cursor()
    
#     cursor.execute("""
#         CREATE TABLE IF NOT EXISTS call_data (
#             id INTEGER PRIMARY KEY AUTOINCREMENT,
#             s_no INTEGER,
#             date TEXT,
#             interval TEXT,
#             call_number TEXT,
#             service TEXT,
#             agent TEXT,
#             login_id TEXT,
#             start_time TEXT,
#             end_time TEXT,
#             extension INTEGER,
#             dni TEXT,
#             cli TEXT,
#             deposition TEXT,
#             lead_id TEXT,
#             call_remark TEXT,
#             batch TEXT,
#             dialer_type TEXT,
#             duration REAL,
#             ivr_duration REAL,
#             ring_duration REAL,
#             talk_duration REAL,
#             wrapup_duration REAL,
#             hold_duration REAL,
#             call_status TEXT,
#             hangup_by TEXT,
#             child_call_numbr TEXT,
#             ivr_terminal TEXT,
#             called_did TEXT,
#             sales_service_option TEXT,
#             after_sales_service_option TEXT,
#             upload_date TEXT
#         )
#     """)
    
#     conn.commit()
#     conn.close()

# init_database()

# # Pydantic Models
# class FilterParams(BaseModel):
#     dateRange: Optional[str] = "all"
#     service: Optional[str] = "all"
#     agent: Optional[str] = "all"
#     dialer: Optional[str] = "all"
#     disposition: Optional[str] = "all"

# class KPIResponse(BaseModel):
#     totalCalls: int
#     answeredCalls: int
#     notAnswered: int
#     answerRate: str
#     abandonmentRate: str
#     avgAHT: str
#     avgTalkTime: str
#     avgHoldTime: str
#     avgWrapupTime: str
#     serviceLevel: str
#     conversionRate: str
#     salesCalls: int
#     transferRate: str
#     customerHangups: str
#     ivrResolved: str

# # Helper Functions
# def clean_column_name(col: str) -> str:
#     """Convert column names to database format""" 
#     return col.lower().replace(' ', '_').replace('/', '_') 

# def load_data_from_db(filters: FilterParams = None) -> pd.DataFrame:
#     """Load data from SQLite database with optional filters"""
#     conn = sqlite3.connect(DB_PATH)
    
#     query = "SELECT * FROM call_data WHERE 1=1"
#     params = []
    
#     if filters:
#         if filters.service != "all":
#             query += " AND service = ?"
#             params.append(filters.service)
        
#         if filters.agent != "all":
#             query += " AND agent = ?"
#             params.append(filters.agent)
        
#         if filters.dialer != "all":
#             query += " AND dialer_type = ?"
#             params.append(filters.dialer)
        
#         if filters.disposition != "all":
#             query += " AND deposition = ?"
#             params.append(filters.disposition)
        
#         if filters.dateRange != "all":
#             days = 7 if filters.dateRange == "7days" else 30
#             cutoff_date = (datetime.now() - timedelta(days=days)).strftime('%Y-%m-%d')
#             query += " AND date >= ?"
#             params.append(cutoff_date)
    
#     df = pd.read_sql_query(query, conn, params=params)
#     conn.close()
    
#     return df

# def calculate_kpis(df: pd.DataFrame, service_level_threshold: int = 20) -> Dict:
#     """Calculate all KPIs from dataframe"""
#     if df.empty:
#         return {
#             "totalCalls": 0,
#             "answeredCalls": 0,
#             "notAnswered": 0,
#             "answerRate": "0.0",
#             "abandonmentRate": "0.0",
#             "avgAHT": "0.0",
#             "avgTalkTime": "0.0",
#             "avgHoldTime": "0.0",
#             "avgWrapupTime": "0.0",
#             "serviceLevel": "0.0",
#             "conversionRate": "0.0",
#             "salesCalls": 0,
#             "transferRate": "0.0",
#             "customerHangups": "0.0",
#             "ivrResolved": "0.0"
#         }
    
#     total_calls = len(df)
#     answered_calls = len(df[df['call_status'].str.contains('ANSWER|CONNECTED', case=False, na=False)])
    
#     answer_rate = (answered_calls / total_calls * 100) if total_calls > 0 else 0
#     abandonment_rate = 100 - answer_rate
    
#     answered_data = df[df['talk_duration'] > 0]
#     avg_talk = answered_data['talk_duration'].mean() if len(answered_data) > 0 else 0
#     avg_hold = answered_data['hold_duration'].mean() if len(answered_data) > 0 else 0
#     avg_wrapup = answered_data['wrapup_duration'].mean() if len(answered_data) > 0 else 0
#     avg_aht = avg_talk + avg_hold + avg_wrapup
    
#     answered_in_threshold = len(df[
#         (df['call_status'].str.contains('ANSWER|CONNECTED', case=False, na=False)) &
#         (df['ring_duration'] <= service_level_threshold)
#     ])
#     service_level = (answered_in_threshold / answered_calls * 100) if answered_calls > 0 else 0
    
#     sales_calls = len(df[df['deposition'].str.upper() == 'SALE'])
#     conversion_rate = (sales_calls / answered_calls * 100) if answered_calls > 0 else 0
    
#     transfer_rate = (len(df[df['child_call_numbr'].notna() & (df['child_call_numbr'] != '')]) / total_calls * 100) if total_calls > 0 else 0
    
#     customer_hangups = (len(df[df['hangup_by'].str.upper() == 'CUSTOMER']) / answered_calls * 100) if answered_calls > 0 else 0
    
#     ivr_resolved = (len(df[(df['ivr_duration'] > 0) & (df['talk_duration'] == 0)]) / total_calls * 100) if total_calls > 0 else 0
    
#     return {
#         "totalCalls": int(total_calls),
#         "answeredCalls": int(answered_calls),
#         "notAnswered": int(total_calls - answered_calls),
#         "answerRate": f"{answer_rate:.1f}",
#         "abandonmentRate": f"{abandonment_rate:.1f}",
#         "avgAHT": f"{avg_aht / 60:.1f}",
#         "avgTalkTime": f"{avg_talk / 60:.1f}",
#         "avgHoldTime": f"{avg_hold / 60:.1f}",
#         "avgWrapupTime": f"{avg_wrapup / 60:.1f}",
#         "serviceLevel": f"{service_level:.1f}",
#         "conversionRate": f"{conversion_rate:.1f}",
#         "salesCalls": int(sales_calls),
#         "transferRate": f"{transfer_rate:.1f}",
#         "customerHangups": f"{customer_hangups:.1f}",
#         "ivrResolved": f"{ivr_resolved:.1f}"
#     }

# def calculate_agent_performance(df: pd.DataFrame) -> List[Dict]:
#     """Calculate agent performance metrics"""
#     if df.empty:
#         return []
    
#     agents = []
#     for agent_name in df[df['agent'] != 'N/A']['agent'].unique():
#         agent_data = df[df['agent'] == agent_name]
        
#         total = len(agent_data)
#         answered = len(agent_data[agent_data['talk_duration'] > 0])
        
#         answered_data = agent_data[agent_data['talk_duration'] > 0]
#         if len(answered_data) > 0:
#             aht = (answered_data['talk_duration'] + answered_data['hold_duration'] + answered_data['wrapup_duration']).mean()
#         else:
#             aht = 0
        
#         sales = len(agent_data[agent_data['deposition'].str.upper() == 'SALE'])
        
#         top_disp = agent_data['deposition'].value_counts().head(1)
#         top_disposition = f"{top_disp.index[0]} ({top_disp.values[0]})" if len(top_disp) > 0 else "N/A"
        
#         agents.append({
#             "agent": agent_name,
#             "total": int(total),
#             "answered": int(answered),
#             "answerRate": f"{(answered / total * 100):.1f}" if total > 0 else "0.0",
#             "avgAHT": f"{(aht / 60):.1f}",
#             "sales": int(sales),
#             "conversionRate": f"{(sales / answered * 100):.1f}" if answered > 0 else "0.0",
#             "topDisposition": top_disposition
#         })
    
#     return sorted(agents, key=lambda x: x['answered'], reverse=True)

# def calculate_service_performance(df: pd.DataFrame) -> List[Dict]:
#     """Calculate service/campaign performance"""
#     if df.empty:
#         return []
    
#     services = []
#     for service_name in df['service'].unique():
#         service_data = df[df['service'] == service_name]
        
#         total = len(service_data)
#         answered = len(service_data[service_data['talk_duration'] > 0])
#         sales = len(service_data[service_data['deposition'].str.upper() == 'SALE'])
        
#         answered_data = service_data[service_data['talk_duration'] > 0]
#         if len(answered_data) > 0:
#             aht = (answered_data['talk_duration'] + answered_data['hold_duration'] + answered_data['wrapup_duration']).mean()
#         else:
#             aht = 0
        
#         services.append({
#             "service": service_name,
#             "total": int(total),
#             "answered": int(answered),
#             "answerRate": f"{(answered / total * 100):.1f}" if total > 0 else "0.0",
#             "sales": int(sales),
#             "conversionRate": f"{(sales / answered * 100):.1f}" if answered > 0 else "0.0",
#             "avgAHT": f"{(aht / 60):.1f}"
#         })
    
#     return sorted(services, key=lambda x: x['total'], reverse=True)

# def calculate_hourly_trends(df: pd.DataFrame) -> List[Dict]:
#     """Calculate hourly trends"""
#     if df.empty:
#         return []
    
#     df['hour'] = df['interval'].str.split('-').str[0].str.split(':').str[0]
    
#     hourly = []
#     for hour in sorted(df['hour'].unique()):
#         hour_data = df[df['hour'] == hour]
#         total = len(hour_data)
#         answered = len(hour_data[hour_data['call_status'].str.contains('ANSWER', case=False, na=False)])
#         avg_ring = hour_data['ring_duration'].mean()
        
#         hourly.append({
#             "hour": f"{hour}:00",
#             "total": int(total),
#             "answered": int(answered),
#             "answerRate": f"{(answered / total * 100):.1f}" if total > 0 else "0.0",
#             "avgRingTime": f"{avg_ring:.1f}"
#         })
    
#     return hourly

# def calculate_daily_trends(df: pd.DataFrame) -> List[Dict]:
#     """Calculate daily trends"""
#     if df.empty:
#         return []
    
#     daily = []
#     for date in sorted(df['date'].unique()):
#         date_data = df[df['date'] == date]
#         total = len(date_data)
#         answered = len(date_data[date_data['call_status'].str.contains('ANSWER', case=False, na=False)])
#         sales = len(date_data[date_data['deposition'].str.upper() == 'SALE'])
        
#         daily.append({
#             "date": date[5:],  # Remove year, keep MM-DD
#             "total": int(total),
#             "answered": int(answered),
#             "sales": int(sales),
#             "answerRate": float(f"{(answered / total * 100):.1f}") if total > 0 else 0.0
#         })
    
#     return daily

# def calculate_disposition_data(df: pd.DataFrame) -> List[Dict]:
#     """Calculate disposition distribution"""
#     if df.empty:
#         return []
    
#     disp_counts = df['deposition'].value_counts()
#     total = len(df)
    
#     return [
#         {
#             "name": disp,
#             "value": int(count),
#             "percentage": f"{(count / total * 100):.1f}"
#         }
#         for disp, count in disp_counts.items()
#     ]

# def calculate_dialer_comparison(df: pd.DataFrame) -> List[Dict]:
#     """Calculate dialer type comparison"""
#     if df.empty:
#         return []
    
#     dialers = []
#     for dialer_type in df['dialer_type'].unique():
#         dialer_data = df[df['dialer_type'] == dialer_type]
        
#         total = len(dialer_data)
#         answered = len(dialer_data[dialer_data['talk_duration'] > 0])
#         sales = len(dialer_data[dialer_data['deposition'].str.upper() == 'SALE'])
        
#         answered_data = dialer_data[dialer_data['talk_duration'] > 0]
#         if len(answered_data) > 0:
#             aht = (answered_data['talk_duration'] + answered_data['hold_duration'] + answered_data['wrapup_duration']).mean()
#         else:
#             aht = 0
        
#         dialers.append({
#             "name": dialer_type,
#             "total": int(total),
#             "answered": int(answered),
#             "answerRate": float(f"{(answered / total * 100):.1f}") if total > 0 else 0.0,
#             "sales": int(sales),
#             "conversionRate": float(f"{(sales / answered * 100):.1f}") if answered > 0 else 0.0,
#             "avgAHT": float(f"{(aht / 60):.1f}")
#         })
    
#     return dialers

# # API Endpoints

# @app.get("/test")
# async def test_endpoint():
#     return {"message": "server is working"}

# @app.get("/")
# async def root():
#     return {"message": "Call Center Analytics API", "status": "running"}

# @app.post("/api/upload")
# async def upload_csv(file: UploadFile = File(...)):
#     """Upload and process CSV file"""
#     try:
#         # Read CSV file
#         contents = await file.read()
#         df = pd.read_csv(io.StringIO(contents.decode('utf-8')))
        
#         # clean the column names
#         df.columns = [clean_column_name(col) for col in df.columns]

#         # filling the null vaues there in agentname  column and batch column
        
#         df['agent_name'] = df['agent_name'].fillna('Unknown')
#         df['batch'] = df['batch'].fillna('Unknown')
#         # Clean column names
#         print("*0"*20)
#         print(f"Uploaded columns: {df.columns.tolist()}")
#         # Add upload timestamps
#         df['upload_date'] = datetime.now().strftime('%Y-%m-%d %H:%M:%S')

#         # Save to database
#         conn = sqlite3.connect(DB_PATH)
#         df.to_sql('call_data', conn, if_exists='replace', index=False)
#         conn.close()
        
#         return {
#             "success": True,
#             "message": f"Successfully uploaded {len(df)} records",
#             "records": len(df),
#             "data":df.to_dict(orient='records'),
#             "headers":df.columns.tolist()
#         }
        
#     except Exception as e:
#         raise HTTPException(status_code=400, detail=f"Error processing file: {str(e)}")


# @app.post("/api/analytics/kpis")
# async def get_kpis(filters: FilterParams, service_level_threshold: int = 20):
#     """Get KPIs with optional filters"""
#     try:
#         df = load_data_from_db(filters)
#         kpis = calculate_kpis(df, service_level_threshold)
#         return kpis
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=f"Error calculating KPIs: {str(e)}")

# @app.post("/api/analytics/agents")
# async def get_agent_performance(filters: FilterParams):
#     """Get agent performance data"""
#     try:
#         df = load_data_from_db(filters)
#         agents = calculate_agent_performance(df)
#         return agents
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=f"Error calculating agent performance: {str(e)}")

# @app.post("/api/analytics/services")
# async def get_service_performance(filters: FilterParams):
#     """Get service/campaign performance"""
#     try:
#         df = load_data_from_db(filters)
#         services = calculate_service_performance(df)
#         return services
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=f"Error calculating service performance: {str(e)}")

# @app.post("/api/analytics/hourly-trends")
# async def get_hourly_trends(filters: FilterParams):
#     """Get hourly trends"""
#     try:
#         df = load_data_from_db(filters)
#         trends = calculate_hourly_trends(df)
#         return trends
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=f"Error calculating hourly trends: {str(e)}")

# @app.post("/api/analytics/daily-trends")
# async def get_daily_trends(filters: FilterParams):
#     """Get daily trends"""
#     try:
#         df = load_data_from_db(filters)
#         trends = calculate_daily_trends(df)
#         return trends
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=f"Error calculating daily trends: {str(e)}")

# @app.post("/api/analytics/dispositions")
# async def get_dispositions(filters: FilterParams):
#     """Get disposition distribution"""
#     try:
#         df = load_data_from_db(filters)
#         dispositions = calculate_disposition_data(df)
#         return dispositions
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=f"Error calculating dispositions: {str(e)}")

# @app.post("/api/analytics/dialers")
# async def get_dialer_comparison(filters: FilterParams):
#     """Get dialer type comparison"""
#     try:
#         df = load_data_from_db(filters)
#         dialers = calculate_dialer_comparison(df)
#         return dialers
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=f"Error calculating dialer comparison: {str(e)}")

# @app.post("/api/analytics/filters/options")
# async def get_filter_options(filters: FilterParams):
#     """Get unique values for filter dropdowns"""
#     try:
#         df = load_data_from_db()
        
#         return {
#             "services": df['service'].unique().tolist(),
#             "agents": df[df['agent'] != 'N/A']['agent'].unique().tolist(),
#             "dialers": df['dialer_type'].unique().tolist(),
#             "dispositions": df['deposition'].unique().tolist()
#         }
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=f"Error getting filter options: {str(e)}")

# @app.post("/api/analytics/raw-data")
# async def get_raw_data(filters: FilterParams, limit: int = 100):
#     """Get raw data with optional filters"""
#     try:
#         df = load_data_from_db(filters)
#         data = df.head(limit).to_dict('records')
#         return {
#             "data": data,
#             "total": len(df),
#             "showing": min(limit, len(df))
#         }
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=f"Error getting raw data: {str(e)}")

# @app.get("/api/health")
# async def health_check():
#     """Health check endpoint"""
#     conn = sqlite3.connect(DB_PATH)
#     cursor = conn.cursor()
#     cursor.execute("SELECT COUNT(*) FROM call_data")
#     count = cursor.fetchone()[0]
#     conn.close()
    
#     return {
#         "status": "healthy",
#         "database": "connected",
#         "total_records": count
#     }

# if __name__ == "__main__":
#     import uvicorn
#     print("server is started")
#     uvicorn.run(app, host="0.0.0.0", port=8000)
