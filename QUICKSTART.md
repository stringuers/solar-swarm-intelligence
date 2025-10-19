# ⚡ Quick Start Guide - Solar Swarm Intelligence

**Get the system running in 5 minutes!**

---

##  What You'll Achieve

By the end of this guide, you'll have:
- Generated 90 days of synthetic solar data for 50 households
- Run a 24-hour multi-agent simulation
- Started the API server with real-time WebSocket
- Tested all major endpoints
- Viewed performance metrics

---

## 📋 Prerequisites Check

```bash
# Check Python version (need 3.10+)
python --version

# Check if pip is installed
pip --version

# Check available disk space (need ~500MB)
df -h .
```

---

##  Step-by-Step Setup

### Step 1: Install Dependencies (2 minutes)

```bash
# Navigate to project directory
cd solar-swarm-intelligence

# Create virtual environment
python -m venv venv

# Activate virtual environment
source venv/bin/activate  # On Mac/Linux
# OR
venv\Scripts\activate     # On Windows

# Install all dependencies
pip install -r requirements.txt

# Verify installation
python -c "import torch; import pandas; import fastapi; print('✅ All dependencies installed!')"
```

**Expected output**: ` All dependencies installed!`

---

### Step 2: Configure Environment (30 seconds)

```bash
# Copy environment template
cp .env.example .env

# (Optional) Edit .env if you have API keys
# nano .env
```

**Note**: The system works without API keys using synthetic data!

---

### Step 3: Generate Synthetic Data (1 minute)

```bash
# Generate 90 days of data for 50 households
python main.py generate-data
```

**Expected output**:
```
 Generating synthetic data for 50 houses over 90 days...
 Generated 108000 data points
   Total production: 245678.3 kWh
   Total consumption: 198234.5 kWh
 Saved to data/processed/synthetic/community_90days.csv
 Saved house profiles to data/processed/synthetic/house_profiles.csv
```

**Files created**:
- `data/processed/synthetic/community_90days.csv` (~15 MB)
- `data/processed/synthetic/house_profiles.csv` (~5 KB)

---

### Step 4: Run Your First Simulation (30 seconds)

```bash
# Run 24-hour simulation with 50 agents
python main.py simulate --agents 50 --hours 24
```

**Expected output**:
```
============================================================
   SOLAR SWARM INTELLIGENCE
   IEEE PES Energy Utopia Challenge
============================================================
 Running simulation with 50 agents for 24 hours...

 Starting Solar Swarm Simulation...

 Simulation Results (24 hours):
  Solar Usage: 87.3%
  Grid Import: 12.7%
  Energy Shared: 156.4 kWh
  Total Transfers: 18

========================================
SOLAR SWARM INTELLIGENCE - PERFORMANCE REPORT
========================================

ENERGY METRICS:
--------------
Solar Utilization:      87.3%
Self-Sufficiency:       82.1%
Grid Dependency:        17.9%
Energy Sharing:         12.4%

ECONOMIC IMPACT:
---------------
Daily Savings:          $45.20
Monthly Savings:        $1,356.00
Annual Savings:         $16,498.00
Savings Percentage:     35.2%

ENVIRONMENTAL IMPACT:
--------------------
Daily CO₂ Avoided:      156.8 kg
Monthly CO₂ Avoided:    4,704.0 kg
Annual CO₂ Avoided:     57.23 tons
Trees Equivalent:       2729 trees

========================================

💾 Results saved to results/simulation_results.csv
============================================================
✅ Complete!
============================================================
```

**File created**: `results/simulation_results.csv`

---

### Step 5: Start the API Server (10 seconds)

```bash
# Start FastAPI server
python main.py api
```

**Expected output**:
```
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:      Starting Solar Swarm Intelligence API
INFO:        Agents: 50
INFO:        Battery: 10.0 kWh
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8000
```

**Keep this terminal open!** The server is now running.

---

### Step 6: Test the API (1 minute)

Open a **NEW terminal** and run these commands:

#### Test 1: Health Check
```bash
curl http://localhost:8000/health
```

**Expected**: `{"status":"healthy","timestamp":...}`

#### Test 2: API Root
```bash
curl http://localhost:8000/
```

**Expected**: 
```json
{
  "message": "Solar Swarm Intelligence API",
  "version": "1.0.0",
  "status": "operational",
  "agents": 50
}
```

#### Test 3: Start Simulation via API
```bash
curl -X POST http://localhost:8000/api/v1/simulation/start \
  -H "Content-Type: application/json" \
  -d '{"num_agents": 50, "hours": 24}'
```

**Expected**: `{"message":"Simulation started","num_agents":50,"hours":24}`

#### Test 4: Get Simulation Status
```bash
curl http://localhost:8000/api/v1/simulation/status
```

**Expected**:
```json
{
  "status": "running",
  "current_hour": 12,
  "total_hours": 24,
  "agents_active": 50,
  "message": "Simulation at hour 12/24"
}
```

#### Test 5: Get Community Metrics
```bash
curl http://localhost:8000/api/v1/metrics/community
```

**Expected**:
```json
{
  "solar_utilization_pct": 87.3,
  "self_sufficiency_pct": 82.1,
  "grid_dependency_pct": 17.9,
  "energy_shared_kwh": 156.4,
  "cost_savings_daily": 45.20,
  "cost_savings_monthly": 1356.00,
  "co2_avoided_kg": 156.8,
  "trees_equivalent": 2729
}
```

#### Test 6: Run Cloudy Day Scenario
```bash
curl -X POST http://localhost:8000/api/v1/scenario/run \
  -H "Content-Type: application/json" \
  -d '{"scenario_type": "cloudy_day"}'
```

**Expected**: Results showing reduced solar utilization (~60%)

#### Test 7: Get 24-Hour Forecast
```bash
curl http://localhost:8000/api/v1/forecast/24h
```

**Expected**: JSON with 24 forecast points

---

### Step 7: View API Documentation

Open your browser and go to:

**http://localhost:8000/docs**

You'll see the **interactive Swagger UI** with all endpoints!

Try clicking on any endpoint and using the "Try it out" button.

---

### Step 8: Test WebSocket (Optional)

Create a file `test_websocket.html`:

```html
<!DOCTYPE html>
<html>
<head>
    <title>Solar Swarm WebSocket Test</title>
</head>
<body>
    <h1>Solar Swarm Intelligence - WebSocket Test</h1>
    <div id="status">Connecting...</div>
    <pre id="data"></pre>

    <script>
        const ws = new WebSocket('ws://localhost:8000/ws/simulation');
        
        ws.onopen = () => {
            document.getElementById('status').textContent = '✅ Connected!';
            ws.send('ping');
        };
        
        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            document.getElementById('data').textContent = JSON.stringify(data, null, 2);
        };
        
        ws.onerror = (error) => {
            document.getElementById('status').textContent = '❌ Error: ' + error;
        };
    </script>
</body>
</html>
```

Open this file in your browser to see real-time simulation updates!

---

##  Success! What You've Accomplished

You now have:

1. ✅ **Synthetic Data**: 108,000 data points for 50 households
2. ✅ **Working Simulation**: 50-agent swarm with 87% solar utilization
3. ✅ **REST API**: 9 endpoints serving simulation data
4. ✅ **WebSocket**: Real-time updates streaming
5. ✅ **Metrics**: Energy, economic, and environmental KPIs
6. ✅ **Scenarios**: Cloudy day, panel failure, peak demand tests

---

## 🔥 Next Steps

### Try Different Scenarios

```bash
# More agents
python main.py simulate --agents 100 --hours 24

# Longer simulation
python main.py simulate --agents 50 --hours 168  # 1 week

# Train RL model
python main.py train --model ppo

# Run tests
python main.py test
```

### Explore the API

Visit http://localhost:8000/docs and try:
- `/api/v1/agents` - See all 50 agents
- `/api/v1/agents/0` - See specific agent details
- `/api/v1/metrics/history` - Historical data
- `/api/v1/scenario/run` - Try different scenarios

### View the Data

```bash
# View generated data
head -20 data/processed/synthetic/community_90days.csv

# View simulation results
head -20 results/simulation_results.csv

# View house profiles
cat data/processed/synthetic/house_profiles.csv
```

---

##  Troubleshooting

### Problem: "Module not found"
**Solution**: 
```bash
pip install -r requirements.txt
```

### Problem: "Port 8000 already in use"
**Solution**: 
```bash
# Kill existing process
lsof -ti:8000 | xargs kill -9

# Or use different port
# Edit config.yaml: api.port: 8001
```

### Problem: "No such file or directory: config.yaml"
**Solution**: 
```bash
# Make sure you're in the project root
cd solar-swarm-intelligence
ls config.yaml  # Should exist
```

### Problem: API returns 404
**Solution**: 
```bash
# Make sure to include /api/v1/ prefix
curl http://localhost:8000/api/v1/simulation/status
```

### Problem: Simulation takes too long
**Solution**: 
```bash
# Reduce agents or hours
python main.py simulate --agents 10 --hours 12
```

---

##  Understanding the Results

### Solar Utilization (Target: 87%)
- **What it means**: Percentage of solar energy actually used (not wasted)
- **Good**: >85%
- **Excellent**: >90%

### Cost Savings (Target: 35%)
- **What it means**: Money saved vs. buying all energy from grid
- **Good**: >30%
- **Excellent**: >40%

### Energy Sharing
- **What it means**: kWh shared between neighbors
- **More sharing = Better community optimization**

### Grid Dependency (Target: <20%)
- **What it means**: How much you still need from the grid
- **Good**: <20%
- **Excellent**: <15%

---

##  Performance Benchmarks

Your system should achieve:

| Metric | Expected Value |
|--------|---------------|
| Solar Utilization | 85-90% |
| Cost Savings | 30-40% |
| Grid Dependency | 10-20% |
| Simulation Speed | <10 seconds for 24h |
| API Response | <100ms |
| WebSocket Latency | <50ms |

---

##  Learn More

- **Full Documentation**: See `README.md`
- **Implementation Details**: See `IMPLEMENTATION_SUMMARY.md`
- **API Reference**: http://localhost:8000/docs
- **Configuration**: Edit `config.yaml`

---

##  Need Help?

1. Check the logs: `logs/solar_swarm.log`
2. Read the error message carefully
3. Verify all dependencies are installed
4. Make sure you're in the project root directory
5. Check that ports 8000 is available

---

##  Quick Reference Commands

```bash
# Generate data
python main.py generate-data

# Run simulation
python main.py simulate --agents 50 --hours 24

# Start API
python main.py api

# Train models
python main.py train --model all

# Run tests
python main.py test

# View logs
tail -f logs/solar_swarm.log

# Stop API server
Ctrl+C
```

---

** Congratulations! You're now running a multi-agent solar optimization system!**

**Built with ❤️ for a sustainable energy future**
