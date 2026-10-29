import os
from pathlib import Path

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base

load_dotenv(Path(__file__).resolve().parents[2] / '.env')
load_dotenv(Path(__file__).resolve().parents[1] / '.env')

local_database = Path(__file__).resolve().parents[1] / 'dashboard.db'
database_url = os.getenv('DATABASE_URL') or f'sqlite:///{local_database.as_posix()}'
engine = create_engine(database_url, connect_args={'check_same_thread': False} if database_url.startswith('sqlite:') else {})
Base = declarative_base()
