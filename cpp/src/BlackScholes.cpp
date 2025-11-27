#include "BlackScholes.h"
#include <cmath>
#include <algorithm>

#ifndef M_PI
#define M_PI 3.14159265358979323846
#endif

BlackScholes::BlackScholes(double stockPrice, double strikePrice, double timeToMaturity,
                           double riskFreeRate, double volatility)
    : S(stockPrice), K(strikePrice), T(timeToMaturity), r(riskFreeRate), sigma(volatility) {}

double BlackScholes::normalCDF(double x) const {
    return 0.5 * std::erfc(-x / std::sqrt(2.0));
}

double BlackScholes::normalPDF(double x) const {
    return std::exp(-0.5 * x * x) / std::sqrt(2.0 * M_PI);
}

double BlackScholes::d1() const {
    return (std::log(S / K) + (r + 0.5 * sigma * sigma) * T) / (sigma * std::sqrt(T));
}

double BlackScholes::d2() const {
    return d1() - sigma * std::sqrt(T);
}

double BlackScholes::callPrice() const {
    double d1_val = d1();
    double d2_val = d2();
    return S * normalCDF(d1_val) - K * std::exp(-r * T) * normalCDF(d2_val);
}

double BlackScholes::putPrice() const {
    double d1_val = d1();
    double d2_val = d2();
    return K * std::exp(-r * T) * normalCDF(-d2_val) - S * normalCDF(-d1_val);
}

double BlackScholes::callDelta() const {
    return normalCDF(d1());
}

double BlackScholes::putDelta() const {
    return normalCDF(d1()) - 1.0;
}

double BlackScholes::gamma() const {
    double d1_val = d1();
    return normalPDF(d1_val) / (S * sigma * std::sqrt(T));
}

double BlackScholes::vega() const {
    double d1_val = d1();
    return S * std::sqrt(T) * normalPDF(d1_val) / 100.0;  // Divided by 100 for 1% change
}

double BlackScholes::callTheta() const {
    double d1_val = d1();
    double d2_val = d2();
    double term1 = -(S * sigma * normalPDF(d1_val)) / (2.0 * std::sqrt(T));
    double term2 = -r * K * std::exp(-r * T) * normalCDF(d2_val);
    return (term1 + term2) / 365.0;  // Per day
}

double BlackScholes::putTheta() const {
    double d1_val = d1();
    double d2_val = d2();
    double term1 = -(S * sigma * normalPDF(d1_val)) / (2.0 * std::sqrt(T));
    double term2 = r * K * std::exp(-r * T) * normalCDF(-d2_val);
    return (term1 + term2) / 365.0;  // Per day
}

double BlackScholes::callRho() const {
    return K * T * std::exp(-r * T) * normalCDF(d2()) / 100.0;  // For 1% change
}

double BlackScholes::putRho() const {
    return -K * T * std::exp(-r * T) * normalCDF(-d2()) / 100.0;  // For 1% change
}

OptionResult BlackScholes::calculateAll() const {
    OptionResult result;
    result.callPrice = callPrice();
    result.putPrice = putPrice();
    result.callDelta = callDelta();
    result.putDelta = putDelta();
    result.gamma = gamma();
    result.vega = vega();
    result.callTheta = callTheta();
    result.putTheta = putTheta();
    result.callRho = callRho();
    result.putRho = putRho();
    return result;
}

ProbabilityData BlackScholes::calculateProbabilities(bool isCall) const {
    ProbabilityData prob;
    double d2_val = d2();
    
    if (isCall) {
        prob.probabilityITM = normalCDF(d2_val);
        prob.probabilityOTM = 1.0 - prob.probabilityITM;
        prob.breakEvenPrice = K + callPrice();
    } else {
        prob.probabilityITM = normalCDF(-d2_val);
        prob.probabilityOTM = 1.0 - prob.probabilityITM;
        prob.breakEvenPrice = K - putPrice();
    }
    
    prob.expectedValue = S * std::exp(r * T);
    
    return prob;
}

std::vector<std::pair<double, double>> BlackScholes::generatePriceDistribution(int points) const {
    std::vector<std::pair<double, double>> distribution;
    
    double mean = std::log(S) + (r - 0.5 * sigma * sigma) * T;
    double stdDev = sigma * std::sqrt(T);
    
    double minPrice = S * std::exp(-3 * stdDev);
    double maxPrice = S * std::exp(3 * stdDev);
    double step = (maxPrice - minPrice) / points;
    
    for (int i = 0; i <= points; ++i) {
        double price = minPrice + i * step;
        double logPrice = std::log(price);
        double z = (logPrice - mean) / stdDev;
        double probability = normalPDF(z) / (price * stdDev);
        distribution.push_back({price, probability});
    }
    
    return distribution;
}

std::vector<std::pair<double, double>> BlackScholes::generateProfitLoss(bool isCall, double premium, int points) const {
    std::vector<std::pair<double, double>> profitLoss;
    
    double minPrice = K * 0.5;
    double maxPrice = K * 1.5;
    double step = (maxPrice - minPrice) / points;
    
    for (int i = 0; i <= points; ++i) {
        double price = minPrice + i * step;
        double profit;
        
        if (isCall) {
            profit = std::max(0.0, price - K) - premium;
        } else {
            profit = std::max(0.0, K - price) - premium;
        }
        
        profitLoss.push_back({price, profit});
    }
    
    return profitLoss;
}

double BlackScholes::impliedVolatility(double marketPrice, double S, double K, double T, 
                                      double r, bool isCall, double tolerance, int maxIterations) {
    double sigma = 0.5;  // Initial guess
    
    for (int i = 0; i < maxIterations; ++i) {
        BlackScholes bs(S, K, T, r, sigma);
        double price = isCall ? bs.callPrice() : bs.putPrice();
        double diff = price - marketPrice;
        
        if (std::abs(diff) < tolerance) {
            return sigma;
        }
        
        double vega = bs.vega() * 100.0;  // Undo the /100 scaling
        if (vega < 1e-10) {
            break;
        }
        
        sigma = sigma - diff / vega;
        sigma = std::max(0.01, std::min(5.0, sigma));  // Keep sigma in reasonable range
    }
    
    return sigma;
}

void BlackScholes::setStockPrice(double stockPrice) { S = stockPrice; }
void BlackScholes::setStrikePrice(double strikePrice) { K = strikePrice; }
void BlackScholes::setTimeToMaturity(double timeToMaturity) { T = timeToMaturity; }
void BlackScholes::setRiskFreeRate(double riskFreeRate) { r = riskFreeRate; }
void BlackScholes::setVolatility(double volatility) { sigma = volatility; }
