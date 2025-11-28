from pydantic import BaseModel, Field
from typing import List, Tuple

class OptionInput(BaseModel):
    stock_price: float = Field(..., gt=0, description="Current stock price")
    strike_price: float = Field(..., gt=0, description="Strike price")
    time_to_maturity: float = Field(..., gt=0, description="Time to maturity in years")
    risk_free_rate: float = Field(..., ge=0, le=1, description="Risk-free interest rate")
    volatility: float = Field(..., gt=0, le=5, description="Volatility (sigma)")

class GreeksResponse(BaseModel):
    call_delta: float
    put_delta: float
    gamma: float
    vega: float
    call_theta: float
    put_theta: float
    call_rho: float
    put_rho: float

class ProbabilityResponse(BaseModel):
    probability_itm: float
    probability_otm: float
    expected_value: float
    break_even_price: float

class OptionResponse(BaseModel):
    call_price: float
    put_price: float
    greeks: GreeksResponse
    call_probabilities: ProbabilityResponse
    put_probabilities: ProbabilityResponse

class PricePoint(BaseModel):
    price: float
    value: float

class DistributionResponse(BaseModel):
    distribution: List[PricePoint]

class ProfitLossResponse(BaseModel):
    data: List[PricePoint]

class ImpliedVolatilityInput(BaseModel):
    market_price: float = Field(..., gt=0)
    stock_price: float = Field(..., gt=0)
    strike_price: float = Field(..., gt=0)
    time_to_maturity: float = Field(..., gt=0)
    risk_free_rate: float = Field(..., ge=0, le=1)
    is_call: bool = True

class ImpliedVolatilityResponse(BaseModel):
    implied_volatility: float

class HeatmapInput(BaseModel):
    stock_price: float = Field(..., gt=0)
    strike_price: float = Field(..., gt=0)
    time_to_maturity: float = Field(..., gt=0)
    risk_free_rate: float = Field(..., ge=0, le=1)
    volatility: float = Field(..., gt=0, le=5)
    min_spot_price: float = Field(default=70, gt=0)
    max_spot_price: float = Field(default=130, gt=0)
    min_volatility: float = Field(default=0.1, gt=0, le=1)
    max_volatility: float = Field(default=0.4, gt=0, le=1)
