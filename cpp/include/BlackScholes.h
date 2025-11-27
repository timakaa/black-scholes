#ifndef BLACKSCHOLES_H
#define BLACKSCHOLES_H

#include <cmath>
#include <vector>
#include <map>
#include <string>

struct OptionResult {
    double callPrice;
    double putPrice;
    double callDelta;
    double putDelta;
    double gamma;
    double vega;
    double callTheta;
    double putTheta;
    double callRho;
    double putRho;
};

struct ProbabilityData {
    double probabilityITM;      // Probability of being in-the-money
    double probabilityOTM;      // Probability of being out-of-the-money
    double expectedValue;       // Expected value at expiration
    double breakEvenPrice;      // Break-even stock price
};

class BlackScholes {
private:
    double S;      // Current stock price
    double K;      // Strike price
    double T;      // Time to maturity (in years)
    double r;      // Risk-free interest rate
    double sigma;  // Volatility

    double normalCDF(double x) const;
    double normalPDF(double x) const;
    double d1() const;
    double d2() const;

public:
    BlackScholes(double stockPrice, double strikePrice, double timeToMaturity, 
                 double riskFreeRate, double volatility);
    
    // Pricing methods
    double callPrice() const;
    double putPrice() const;
    
    // Greeks
    double callDelta() const;
    double putDelta() const;
    double gamma() const;
    double vega() const;
    double callTheta() const;
    double putTheta() const;
    double callRho() const;
    double putRho() const;
    
    // Get all results at once
    OptionResult calculateAll() const;
    
    // Probability calculations
    ProbabilityData calculateProbabilities(bool isCall) const;
    
    // Generate price distribution data
    std::vector<std::pair<double, double>> generatePriceDistribution(int points = 100) const;
    
    // Generate profit/loss data
    std::vector<std::pair<double, double>> generateProfitLoss(bool isCall, double premium, int points = 100) const;
    
    // Implied volatility calculation (Newton-Raphson method)
    static double impliedVolatility(double marketPrice, double S, double K, double T, 
                                   double r, bool isCall, double tolerance = 1e-6, int maxIterations = 100);
    
    // Setters
    void setStockPrice(double stockPrice);
    void setStrikePrice(double strikePrice);
    void setTimeToMaturity(double timeToMaturity);
    void setRiskFreeRate(double riskFreeRate);
    void setVolatility(double volatility);
    
    // Getters
    double getStockPrice() const { return S; }
    double getStrikePrice() const { return K; }
    double getTimeToMaturity() const { return T; }
    double getRiskFreeRate() const { return r; }
    double getVolatility() const { return sigma; }
};

#endif // BLACKSCHOLES_H
