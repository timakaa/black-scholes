#include <pybind11/pybind11.h>
#include <pybind11/stl.h>
#include "BlackScholes.h"

namespace py = pybind11;

PYBIND11_MODULE(blackscholes_cpp, m) {
    m.doc() = "Black-Scholes option pricing model C++ bindings";

    py::class_<OptionResult>(m, "OptionResult")
        .def_readonly("call_price", &OptionResult::callPrice)
        .def_readonly("put_price", &OptionResult::putPrice)
        .def_readonly("call_delta", &OptionResult::callDelta)
        .def_readonly("put_delta", &OptionResult::putDelta)
        .def_readonly("gamma", &OptionResult::gamma)
        .def_readonly("vega", &OptionResult::vega)
        .def_readonly("call_theta", &OptionResult::callTheta)
        .def_readonly("put_theta", &OptionResult::putTheta)
        .def_readonly("call_rho", &OptionResult::callRho)
        .def_readonly("put_rho", &OptionResult::putRho);

    py::class_<ProbabilityData>(m, "ProbabilityData")
        .def_readonly("probability_itm", &ProbabilityData::probabilityITM)
        .def_readonly("probability_otm", &ProbabilityData::probabilityOTM)
        .def_readonly("expected_value", &ProbabilityData::expectedValue)
        .def_readonly("break_even_price", &ProbabilityData::breakEvenPrice);

    py::class_<BlackScholes>(m, "BlackScholes")
        .def(py::init<double, double, double, double, double>(),
             py::arg("stock_price"),
             py::arg("strike_price"),
             py::arg("time_to_maturity"),
             py::arg("risk_free_rate"),
             py::arg("volatility"))
        .def("call_price", &BlackScholes::callPrice)
        .def("put_price", &BlackScholes::putPrice)
        .def("call_delta", &BlackScholes::callDelta)
        .def("put_delta", &BlackScholes::putDelta)
        .def("gamma", &BlackScholes::gamma)
        .def("vega", &BlackScholes::vega)
        .def("call_theta", &BlackScholes::callTheta)
        .def("put_theta", &BlackScholes::putTheta)
        .def("call_rho", &BlackScholes::callRho)
        .def("put_rho", &BlackScholes::putRho)
        .def("calculate_all", &BlackScholes::calculateAll)
        .def("calculate_probabilities", &BlackScholes::calculateProbabilities)
        .def("generate_price_distribution", &BlackScholes::generatePriceDistribution,
             py::arg("points") = 100)
        .def("generate_profit_loss", &BlackScholes::generateProfitLoss,
             py::arg("is_call"),
             py::arg("premium"),
             py::arg("points") = 100)
        .def_static("implied_volatility", &BlackScholes::impliedVolatility,
                   py::arg("market_price"),
                   py::arg("stock_price"),
                   py::arg("strike_price"),
                   py::arg("time_to_maturity"),
                   py::arg("risk_free_rate"),
                   py::arg("is_call"),
                   py::arg("tolerance") = 1e-6,
                   py::arg("max_iterations") = 100)
        .def("set_stock_price", &BlackScholes::setStockPrice)
        .def("set_strike_price", &BlackScholes::setStrikePrice)
        .def("set_time_to_maturity", &BlackScholes::setTimeToMaturity)
        .def("set_risk_free_rate", &BlackScholes::setRiskFreeRate)
        .def("set_volatility", &BlackScholes::setVolatility)
        .def("get_stock_price", &BlackScholes::getStockPrice)
        .def("get_strike_price", &BlackScholes::getStrikePrice)
        .def("get_time_to_maturity", &BlackScholes::getTimeToMaturity)
        .def("get_risk_free_rate", &BlackScholes::getRiskFreeRate)
        .def("get_volatility", &BlackScholes::getVolatility);
}
