from sqlalchemy import Column, Integer, String, Float, Date

from app.database import Base


class CloudCost(Base):
    __tablename__ = "cloud_costs"

    id = Column(Integer, primary_key=True, index=True)
    provider = Column(String)
    service = Column(String)
    region = Column(String)
    cost = Column(Float)
    usage = Column(Float)
    billing_date = Column(Date)