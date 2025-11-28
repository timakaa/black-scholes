import numpy as np
import matplotlib
matplotlib.use('Agg')  # Non-interactive backend
import matplotlib.pyplot as plt
import seaborn as sns
from io import BytesIO
import base64

def create_heatmap(data: np.ndarray, 
                   x_labels: list, 
                   y_labels: list,
                   title: str,
                   xlabel: str,
                   ylabel: str,
                   cmap: str = 'RdYlGn',
                   fmt: str = '.2f') -> str:
    """
    Create a heatmap and return it as a base64 encoded PNG
    
    Args:
        data: 2D numpy array of values
        x_labels: Labels for x-axis
        y_labels: Labels for y-axis
        title: Chart title
        xlabel: X-axis label
        ylabel: Y-axis label
        cmap: Colormap name
    
    Returns:
        Base64 encoded PNG image string
    """
    fig, ax = plt.subplots(figsize=(11, 8), facecolor='#0f172a')
    ax.set_facecolor('#1e293b')
    
    # Create heatmap with better contrast
    im = ax.imshow(data, cmap=cmap, aspect='auto', interpolation='bilinear', origin='lower')
    
    # Add text annotations on the heatmap
    for i in range(data.shape[0]):
        for j in range(data.shape[1]):
            value = data[i, j]
            # Choose text color based on value for better contrast
            text_color = 'white' if value < data.max() * 0.7 else 'black'
            text = ax.text(j, i, f'{value:{fmt}}',
                          ha="center", va="center", color=text_color, 
                          fontsize=9, fontweight='bold')
    
    # Set ticks and labels
    ax.set_xticks(np.arange(len(x_labels)))
    ax.set_yticks(np.arange(len(y_labels)))
    ax.set_xticklabels(x_labels, color='#93c5fd', fontsize=10)
    ax.set_yticklabels(y_labels, color='#93c5fd', fontsize=10)
    
    # Rotate x labels for better readability
    plt.setp(ax.get_xticklabels(), rotation=45, ha="right", rotation_mode="anchor")
    
    # Add colorbar
    cbar = plt.colorbar(im, ax=ax)
    cbar.ax.yaxis.set_tick_params(color='#93c5fd')
    cbar.outline.set_edgecolor('#475569')
    plt.setp(plt.getp(cbar.ax.axes, 'yticklabels'), color='#93c5fd')
    
    # Labels and title
    ax.set_xlabel(xlabel, color='#93c5fd', fontsize=12, fontweight='bold')
    ax.set_ylabel(ylabel, color='#93c5fd', fontsize=12, fontweight='bold')
    ax.set_title(title, color='#f8fafc', fontsize=14, fontweight='bold', pad=20)
    
    # Style the spines
    for spine in ax.spines.values():
        spine.set_edgecolor('#475569')
    
    plt.tight_layout()
    
    # Convert to base64
    buffer = BytesIO()
    plt.savefig(buffer, format='png', dpi=120, facecolor='#0f172a', 
                edgecolor='none', bbox_inches='tight')
    buffer.seek(0)
    image_base64 = base64.b64encode(buffer.read()).decode()
    plt.close(fig)
    
    return f"data:image/png;base64,{image_base64}"


def generate_option_heatmap(bs_model, option_type: str, 
                           stock_range: tuple = (0.7, 1.3),
                           time_range: tuple = (0.1, 2.0),
                           points: int = 25) -> str:
    """
    Generate a heatmap showing option prices across different stock prices and times
    
    Args:
        bs_model: BlackScholes model instance
        option_type: 'call' or 'put'
        stock_range: (min_multiplier, max_multiplier) for stock price
        time_range: (min_time, max_time) in years
        points: Number of points in each dimension
    
    Returns:
        Base64 encoded PNG image
    """
    # Save original values
    S0 = bs_model.get_stock_price()
    K = bs_model.get_strike_price()
    T0 = bs_model.get_time_to_maturity()
    r = bs_model.get_risk_free_rate()
    sigma = bs_model.get_volatility()
    
    # Create ranges
    stock_prices = np.linspace(S0 * stock_range[0], S0 * stock_range[1], points)
    times = np.linspace(time_range[0], time_range[1], points)
    
    # Calculate option prices
    prices = np.zeros((len(times), len(stock_prices)))
    
    for i, T in enumerate(times):
        for j, S in enumerate(stock_prices):
            bs_model.set_stock_price(S)
            bs_model.set_time_to_maturity(T)
            
            if option_type == 'call':
                prices[i, j] = bs_model.call_price()
            else:
                prices[i, j] = bs_model.put_price()
    
    # Restore original values
    bs_model.set_stock_price(S0)
    bs_model.set_time_to_maturity(T0)
    
    # Debug: print price range
    print(f"Price range for {option_type}: min={prices.min():.2f}, max={prices.max():.2f}, mean={prices.mean():.2f}")
    
    # Create labels - show fewer labels for clarity
    num_labels = 8
    x_indices = np.linspace(0, len(stock_prices)-1, num_labels, dtype=int)
    y_indices = np.linspace(0, len(times)-1, num_labels, dtype=int)
    
    x_labels = [f"${stock_prices[i]:.0f}" for i in x_indices]
    y_labels = [f"{times[i]:.2f}y" for i in y_indices]
    
    # Downsample data for display
    display_prices = prices[y_indices][:, x_indices]
    
    title = f"{option_type.capitalize()} Option Price (Strike: ${K:.0f}, Vol: {sigma*100:.0f}%)"
    
    return create_heatmap(
        display_prices,
        x_labels,
        y_labels,
        title,
        "Stock Price",
        "Time to Maturity",
        cmap='YlOrRd' if option_type == 'call' else 'YlGnBu',
        fmt='.1f'
    )


def generate_greeks_heatmap(bs_model, greek: str,
                           stock_range: tuple = (0.7, 1.3),
                           vol_range: tuple = (0.1, 0.5),
                           points: int = 20) -> str:
    """
    Generate a heatmap showing a Greek across different stock prices and volatilities
    
    Args:
        bs_model: BlackScholes model instance
        greek: 'delta', 'gamma', 'vega', 'theta', or 'rho'
        stock_range: (min_multiplier, max_multiplier) for stock price
        vol_range: (min_vol, max_vol)
        points: Number of points in each dimension
    
    Returns:
        Base64 encoded PNG image
    """
    S0 = bs_model.get_stock_price()
    K = bs_model.get_strike_price()
    sigma0 = bs_model.get_volatility()
    
    # Create ranges
    stock_prices = np.linspace(S0 * stock_range[0], S0 * stock_range[1], points)
    volatilities = np.linspace(vol_range[0], vol_range[1], points)
    
    # Calculate Greek values
    values = np.zeros((len(volatilities), len(stock_prices)))
    
    greek_methods = {
        'call_delta': lambda: bs_model.call_delta(),
        'put_delta': lambda: bs_model.put_delta(),
        'gamma': lambda: bs_model.gamma(),
        'vega': lambda: bs_model.vega(),
        'call_theta': lambda: bs_model.call_theta(),
        'put_theta': lambda: bs_model.put_theta(),
    }
    
    method = greek_methods.get(greek)
    if not method:
        raise ValueError(f"Unknown Greek: {greek}")
    
    for i, vol in enumerate(volatilities):
        for j, S in enumerate(stock_prices):
            bs_model.set_stock_price(S)
            bs_model.set_volatility(vol)
            values[i, j] = method()
    
    # Restore original values
    bs_model.set_stock_price(S0)
    bs_model.set_volatility(sigma0)
    
    # Create labels
    x_labels = [f"${s:.0f}" for s in stock_prices[::max(1, points//10)]]
    y_labels = [f"{v:.0%}" for v in volatilities[::max(1, points//10)]]
    
    # Adjust data for display
    display_values = values[::max(1, points//10), ::max(1, points//10)]
    
    title = f"{greek.replace('_', ' ').title()} Heatmap (Strike: ${K:.0f})"
    
    return create_heatmap(
        display_values,
        x_labels,
        y_labels,
        title,
        "Stock Price",
        "Volatility",
        cmap='coolwarm'
    )
