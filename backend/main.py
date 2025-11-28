from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from app.models import (
    OptionInput, OptionResponse, GreeksResponse, ProbabilityResponse,
    DistributionResponse, ProfitLossResponse, PricePoint,
    ImpliedVolatilityInput, ImpliedVolatilityResponse
)
import sys
import os

# Add the backend directory to Python path to import the C++ module
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

try:
    import blackscholes_cpp as bs
except ImportError:
    print("Warning: C++ module not found. Please build it first.")
    print("Run: cd cpp && mkdir build && cd build && cmake .. && make && make install")
    bs = None

app = FastAPI(
    title="Black-Scholes API",
    description="API for European option pricing using Black-Scholes model",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {
        "message": "Black-Scholes Option Pricing API",
        "version": "1.0.0",
        "cpp_module_loaded": bs is not None
    }

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "cpp_module": "loaded" if bs else "not loaded"
    }

@app.post("/calculate", response_model=OptionResponse)
def calculate_option(input_data: OptionInput):
    """Calculate option prices, Greeks, and probabilities"""
    if not bs:
        raise HTTPException(status_code=500, detail="C++ module not loaded")
    
    try:
        model = bs.BlackScholes(
            input_data.stock_price,
            input_data.strike_price,
            input_data.time_to_maturity,
            input_data.risk_free_rate,
            input_data.volatility
        )
        
        result = model.calculate_all()
        call_prob = model.calculate_probabilities(True)
        put_prob = model.calculate_probabilities(False)
        
        return OptionResponse(
            call_price=result.call_price,
            put_price=result.put_price,
            greeks=GreeksResponse(
                call_delta=result.call_delta,
                put_delta=result.put_delta,
                gamma=result.gamma,
                vega=result.vega,
                call_theta=result.call_theta,
                put_theta=result.put_theta,
                call_rho=result.call_rho,
                put_rho=result.put_rho
            ),
            call_probabilities=ProbabilityResponse(
                probability_itm=call_prob.probability_itm,
                probability_otm=call_prob.probability_otm,
                expected_value=call_prob.expected_value,
                break_even_price=call_prob.break_even_price
            ),
            put_probabilities=ProbabilityResponse(
                probability_itm=put_prob.probability_itm,
                probability_otm=put_prob.probability_otm,
                expected_value=put_prob.expected_value,
                break_even_price=put_prob.break_even_price
            )
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/heatmap/{heatmap_type}")
def get_heatmap(heatmap_type: str, input_data: OptionInput):
    """Generate heatmap visualization"""
    if not bs:
        raise HTTPException(status_code=500, detail="C++ module not loaded")
    
    try:
        from app.visualization import generate_option_heatmap, generate_greeks_heatmap
        
        model = bs.BlackScholes(
            input_data.stock_price,
            input_data.strike_price,
            input_data.time_to_maturity,
            input_data.risk_free_rate,
            input_data.volatility
        )
        
        if heatmap_type == "call":
            image_data = generate_option_heatmap(model, "call")
        elif heatmap_type == "put":
            image_data = generate_option_heatmap(model, "put")
        elif heatmap_type in ["call_delta", "put_delta", "gamma", "vega", "call_theta", "put_theta"]:
            image_data = generate_greeks_heatmap(model, heatmap_type)
        else:
            raise HTTPException(status_code=400, detail=f"Unknown heatmap type: {heatmap_type}")
        
        return {"image": image_data}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/implied-volatility", response_model=ImpliedVolatilityResponse)
def calculate_implied_volatility(input_data: ImpliedVolatilityInput):
    """Calculate implied volatility from market price"""
    if not bs:
        raise HTTPException(status_code=500, detail="C++ module not loaded")
    
    try:
        iv = bs.BlackScholes.implied_volatility(
            input_data.market_price,
            input_data.stock_price,
            input_data.strike_price,
            input_data.time_to_maturity,
            input_data.risk_free_rate,
            input_data.is_call
        )
        
        return ImpliedVolatilityResponse(implied_volatility=iv)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
