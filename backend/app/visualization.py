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
                   cmap: str = 'viridis',
                   fmt: str = '.2f') -> str:
    """
    Create a heatmap and return it as a base64 encoded PNG
    """
    # Create figure with dark background
    fig, ax = plt.subplots(figsize=(10, 8), facecolor='#0f172a')
    ax.set_facecolor('#1e293b')
    
    # Create heatmap using seaborn for better styling
    sns.heatmap(data, 
                annot=True,  # Show values
                fmt=fmt,  # Format for values
                cmap=cmap,
                cbar=True,
                cbar_kws={'label': 'Option Price ($)'},
                xticklabels=x_labels,
                yticklabels=y_labels,
                linewidths=0.5,
                linecolor='#475569',
                ax=ax,
                annot_kws={'color': 'black', 'fontsize': 9, 'weight': 'bold'})
    
    # Style the colorbar
    cbar = ax.collections[0].colorbar
    cbar.ax.yaxis.set_tick_params(color='#93c5fd')
    cbar.outline.set_edgecolor('#475569')
    plt.setp(plt.getp(cbar.ax.axes, 'yticklabels'), color='#93c5fd')
    cbar.set_label('Option Price ($)', color='#93c5fd', fontsize=10)
    
    # Set labels and title with light colors
    ax.set_xlabel(xlabel, fontsize=12, fontweight='bold', color='#93c5fd')
    ax.set_ylabel(ylabel, fontsize=12, fontweight='bold', color='#93c5fd')
    ax.set_title(title, fontsize=14, fontweight='bold', pad=20, color='#f8fafc')
    
    # Style tick labels
    ax.tick_params(colors='#93c5fd', which='both')
    plt.setp(ax.get_xticklabels(), rotation=45, ha="right", rotation_mode="anchor", color='#93c5fd')
    plt.setp(ax.get_yticklabels(), color='#93c5fd')
    
    # Style spines
    for spine in ax.spines.values():
        spine.set_edgecolor('#475569')
    
    plt.tight_layout()
    
    # Convert to base64
    buffer = BytesIO()
    try:
        fig.savefig(buffer, format='png', dpi=120, bbox_inches='tight', facecolor='#0f172a', edgecolor='none')
        buffer.seek(0)
        image_bytes = buffer.read()
        
        if len(image_bytes) == 0:
            raise ValueError("Generated image is empty!")
        
        image_base64 = base64.b64encode(image_bytes).decode()
        return f"data:image/png;base64,{image_base64}"
    finally:
        plt.close(fig)
        buffer.close()


def generate_option_heatmap(bs_model, option_type: str, 
                           stock_range: tuple = (70, 130),
                           volatility_range: tuple = (0.1, 0.4),
                           points: int = 10) -> str:
    """
    Generate a heatmap showing option prices across different stock prices and volatilities
    
    Args:
        bs_model: BlackScholes model instance
        option_type: 'call' or 'put'
        stock_range: (min_price, max_price) absolute stock prices
        volatility_range: (min_vol, max_vol)
        points: Number of points in each dimension
    
    Returns:
        Base64 encoded PNG image
    """
    # Save original values
    S0 = bs_model.get_stock_price()
    K = bs_model.get_strike_price()
    T0 = bs_model.get_time_to_maturity()
    r = bs_model.get_risk_free_rate()
    sigma0 = bs_model.get_volatility()
    
    # Create ranges using absolute values
    stock_prices = np.linspace(stock_range[0], stock_range[1], points)
    volatilities = np.linspace(volatility_range[0], volatility_range[1], points)
    
    # Calculate option prices
    prices = np.zeros((len(volatilities), len(stock_prices)))
    
    for i, sigma in enumerate(volatilities):
        for j, S in enumerate(stock_prices):
            bs_model.set_stock_price(S)
            bs_model.set_volatility(sigma)
            
            if option_type == 'call':
                prices[i, j] = bs_model.call_price()
            else:
                prices[i, j] = bs_model.put_price()
    
    # Restore original values
    bs_model.set_stock_price(S0)
    bs_model.set_volatility(sigma0)
    bs_model.set_time_to_maturity(T0)
    
    # Create labels
    x_labels = [f"{s:.2f}" for s in stock_prices]
    y_labels = [f"{v:.2f}" for v in volatilities]
    
    # Reverse the data so higher volatility is at top
    prices = np.flipud(prices)
    y_labels = list(reversed(y_labels))
    
    title = f"{option_type.upper()}"
    
    # Use red-to-green colormap (red = low value, green = high value)
    cmap = 'RdYlGn'
    
    return create_heatmap(
        prices,
        x_labels,
        y_labels,
        title,
        "Spot Price",
        "Volatility",
        cmap=cmap,
        fmt='.2f'
    )


def generate_greeks_heatmap(bs_model, greek: str,
                           stock_range: tuple = (70, 130),
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
    # Save original values
    S0 = bs_model.get_stock_price()
    K = bs_model.get_strike_price()
    T0 = bs_model.get_time_to_maturity()
    sigma0 = bs_model.get_volatility()
    
    # Create ranges using absolute values
    stock_prices = np.linspace(stock_range[0], stock_range[1], points)
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
    bs_model.set_time_to_maturity(T0)
    
    # Create labels - show fewer labels for clarity
    num_labels = 8
    x_indices = np.linspace(0, len(stock_prices)-1, num_labels, dtype=int)
    y_indices = np.linspace(0, len(volatilities)-1, num_labels, dtype=int)
    
    x_labels = [f"${stock_prices[i]:.0f}" for i in x_indices]
    y_labels = [f"{volatilities[i]:.0%}" for i in y_indices]
    
    # Downsample data for display
    display_values = values[y_indices][:, x_indices]
    
    title = f"{greek.replace('_', ' ').title()} (Strike: ${K:.0f})"
    
    return create_heatmap(
        display_values,
        x_labels,
        y_labels,
        title,
        "Stock Price",
        "Volatility",
        cmap='coolwarm',
        fmt='.3f'
    )
