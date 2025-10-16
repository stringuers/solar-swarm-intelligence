# 🧪 Testing Guide - Solar Swarm Intelligence

**Complete testing procedures for validation**

---

## 📋 Testing Checklist

Use this checklist to verify the system is working correctly:

- [ ] Dependencies installed
- [ ] Configuration loaded
- [ ] Data generation works
- [ ] Simulation runs successfully
- [ ] API server starts
- [ ] All endpoints respond
- [ ] WebSocket connects
- [ ] Metrics are calculated
- [ ] Scenarios execute
- [ ] Performance targets met

---

## 🚀 Pre-Testing Setup

```bash
# 1. Activate virtual environment
source venv/bin/activate

# 2. Verify installation
python -c "import torch, pandas, fastapi; print('✅ Dependencies OK')"

# 3. Check configuration
python -c "from src.config import config; print(f'✅ Config loaded: {config.num_agents} agents')"

# 4. Create necessary directories
mkdir -p data/raw data/processed/synthetic results logs models
```

---

## 1️⃣ Unit Tests

### Test 1: Configuration Loading

```bash
python -c "
from src.config import config
assert config.num_agents == 50
assert config.battery_capacity == 10.0
print('✅ Configuration test passed')
"
```

**Expected**: `✅ Configuration test passed`

### Test 2: Logger Initialization

```bash
python -c "
from src.utils.logger import logger
logger.info('Test message')
print('✅ Logger test passed')
"
```

**Expected**: `✅ Logger test passed` (and log file created)

### Test 3: Data Generator

```bash
python -c "
from src.data_collection.generate_synthetic import SyntheticDataGenerator
gen = SyntheticDataGenerator(num_houses=5, days=1)
df = gen.generate_dataset()
assert len(df) == 120  # 5 houses * 24 hours
print(f'✅ Data generator test passed: {len(df)} rows')
"
```

**Expected**: `✅ Data generator test passed: 120 rows`

### Test 4: Agent Creation

```bash
python -c "
from src.agents.base_agent import SolarPanelAgent
agent = SolarPanelAgent(agent_id=0, battery_capacity=10)
assert agent.id == 0
assert agent.battery_capacity == 10
print('✅ Agent creation test passed')
"
```

**Expected**: `✅ Agent creation test passed`

---

## 2️⃣ Integration Tests

### Test 5: Full Data Generation

```bash
# Generate complete dataset
python main.py generate-data

# Verify files created
ls -lh data/processed/synthetic/community_90days.csv
ls -lh data/processed/synthetic/house_profiles.csv
```

**Expected**: 
- `community_90days.csv` (~15 MB)
- `house_profiles.csv` (~5 KB)

**Validation**:
```bash
# Check row count (should be 108,000)
wc -l data/processed/synthetic/community_90days.csv

# Check columns
head -1 data/processed/synthetic/community_90days.csv
```

### Test 6: Simulation Execution

```bash
# Run 24-hour simulation
python main.py simulate --agents 10 --hours 24

# Check results file
ls -lh results/simulation_results.csv
head results/simulation_results.csv
```

**Expected**:
- Simulation completes in <10 seconds
- Results file created
- Performance report displayed

**Validation Metrics**:
- Solar Usage: 80-90%
- Grid Import: 10-20%
- Energy Shared: >0 kWh

### Test 7: API Server Startup

```bash
# Start API in background
python main.py api &
API_PID=$!

# Wait for startup
sleep 3

# Test health endpoint
curl http://localhost:8000/health

# Stop API
kill $API_PID
```

**Expected**: `{"status":"healthy","timestamp":...}`

---

## 3️⃣ API Endpoint Tests

### Test 8: Root Endpoint

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

### Test 9: Simulation Start

```bash
curl -X POST http://localhost:8000/api/v1/simulation/start \
  -H "Content-Type: application/json" \
  -d '{"num_agents": 10, "hours": 24}'
```

**Expected**: `{"message":"Simulation started",...}`

### Test 10: Simulation Status

```bash
curl http://localhost:8000/api/v1/simulation/status
```

**Expected**:
```json
{
  "status": "running",
  "current_hour": 5,
  "total_hours": 24,
  "agents_active": 10,
  "message": "Simulation at hour 5/24"
}
```

### Test 11: Get All Agents

```bash
curl http://localhost:8000/api/v1/agents
```

**Expected**: JSON array with 10 agent objects

**Validation**:
```bash
curl http://localhost:8000/api/v1/agents | jq 'length'
# Should return: 10
```

### Test 12: Get Specific Agent

```bash
curl http://localhost:8000/api/v1/agents/0
```

**Expected**:
```json
{
  "id": 0,
  "battery_level": 5.2,
  "battery_capacity": 10.0,
  "production": 3.5,
  "consumption": 2.1,
  "status": "surplus",
  "neighbors": [1, 2, 3]
}
```

### Test 13: Community Metrics

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

### Test 14: Scenario Execution

```bash
# Test cloudy day scenario
curl -X POST http://localhost:8000/api/v1/scenario/run \
  -H "Content-Type: application/json" \
  -d '{"scenario_type": "cloudy_day"}'
```

**Expected**: Results showing ~60% solar utilization (reduced)

```bash
# Test panel failure scenario
curl -X POST http://localhost:8000/api/v1/scenario/run \
  -H "Content-Type: application/json" \
  -d '{"scenario_type": "panel_failure"}'
```

**Expected**: Results showing system adaptation

```bash
# Test peak demand scenario
curl -X POST http://localhost:8000/api/v1/scenario/run \
  -H "Content-Type: application/json" \
  -d '{"scenario_type": "peak_demand"}'
```

**Expected**: Results showing increased grid usage

### Test 15: Forecast Endpoint

```bash
curl http://localhost:8000/api/v1/forecast/24h
```

**Expected**: JSON with 24 forecast points

**Validation**:
```bash
curl http://localhost:8000/api/v1/forecast/24h | jq '.forecast | length'
# Should return: 24
```

### Test 16: Metrics History

```bash
curl http://localhost:8000/api/v1/metrics/history?hours=12
```

**Expected**: Historical data for last 12 hours

---

## 4️⃣ WebSocket Tests

### Test 17: WebSocket Connection

Create `test_websocket.py`:

```python
import asyncio
import websockets
import json

async def test_websocket():
    uri = "ws://localhost:8000/ws/simulation"
    
    try:
        async with websockets.connect(uri) as websocket:
            print("✅ WebSocket connected")
            
            # Send ping
            await websocket.send("ping")
            
            # Receive response
            response = await websocket.recv()
            print(f"✅ Received: {response}")
            
            # Wait for simulation update
            update = await websocket.recv()
            data = json.loads(update)
            print(f"✅ Simulation update received: {len(data.get('houses', []))} houses")
            
    except Exception as e:
        print(f"❌ WebSocket test failed: {e}")

asyncio.run(test_websocket())
```

Run:
```bash
python test_websocket.py
```

**Expected**:
```
✅ WebSocket connected
✅ Received: pong
✅ Simulation update received: 50 houses
```

---

## 5️⃣ Performance Tests

### Test 18: Simulation Speed

```bash
time python main.py simulate --agents 50 --hours 24
```

**Expected**: Completes in <10 seconds

**Pass Criteria**: 
- Real time < 10 seconds ✅
- Real time < 15 seconds ⚠️
- Real time > 15 seconds ❌

### Test 19: API Response Time

```bash
# Install apache bench if needed
# brew install httpd (Mac)
# sudo apt-get install apache2-utils (Linux)

# Test 100 requests
ab -n 100 -c 10 http://localhost:8000/api/v1/simulation/status
```

**Expected**: 
- Mean response time: <100ms ✅
- 95th percentile: <150ms ✅

### Test 20: Memory Usage

```bash
# Start simulation and monitor memory
python main.py simulate --agents 50 --hours 24 &
PID=$!

# Monitor memory (Mac)
ps -o rss= -p $PID | awk '{print $1/1024 " MB"}'

# Wait for completion
wait $PID
```

**Expected**: Memory usage <2GB ✅

### Test 21: Data Generation Speed

```bash
time python main.py generate-data
```

**Expected**: Completes in <60 seconds ✅

---

## 6️⃣ Scenario Tests

### Test 22: Sunny Day Scenario

```python
# Run via pytest
pytest tests/test_scenarios.py::TestSwarmScenarios::test_sunny_day_scenario -v
```

**Expected**: Solar usage >85% ✅

### Test 23: Cloudy Day Scenario

```python
pytest tests/test_scenarios.py::TestSwarmScenarios::test_cloudy_day_scenario -v
```

**Expected**: Solar usage >60%, battery utilization >70% ✅

### Test 24: Panel Failure Scenario

```python
pytest tests/test_scenarios.py::TestSwarmScenarios::test_panel_failure_scenario -v
```

**Expected**: System maintains >70% solar usage despite failures ✅

### Test 25: Peak Demand Scenario

```python
pytest tests/test_scenarios.py::TestSwarmScenarios::test_peak_demand_scenario -v
```

**Expected**: Grid import <30% ✅

### Test 26: Swarm vs Individual

```python
pytest tests/test_scenarios.py::TestSwarmScenarios::test_swarm_vs_individual -v
```

**Expected**: Swarm performs >20% better ✅

---

## 7️⃣ End-to-End Test

### Test 27: Complete Workflow

```bash
#!/bin/bash
echo "🧪 Running complete end-to-end test..."

# 1. Generate data
echo "1️⃣ Generating data..."
python main.py generate-data
if [ $? -ne 0 ]; then echo "❌ Data generation failed"; exit 1; fi
echo "✅ Data generated"

# 2. Run simulation
echo "2️⃣ Running simulation..."
python main.py simulate --agents 50 --hours 24
if [ $? -ne 0 ]; then echo "❌ Simulation failed"; exit 1; fi
echo "✅ Simulation completed"

# 3. Start API
echo "3️⃣ Starting API..."
python main.py api &
API_PID=$!
sleep 3

# 4. Test API
echo "4️⃣ Testing API..."
curl -f http://localhost:8000/health || { echo "❌ API health check failed"; kill $API_PID; exit 1; }
echo "✅ API healthy"

# 5. Start simulation via API
echo "5️⃣ Starting simulation via API..."
curl -X POST http://localhost:8000/api/v1/simulation/start \
  -H "Content-Type: application/json" \
  -d '{"num_agents": 10, "hours": 24}' || { echo "❌ API simulation failed"; kill $API_PID; exit 1; }
echo "✅ API simulation started"

# 6. Wait for simulation
sleep 5

# 7. Get metrics
echo "6️⃣ Getting metrics..."
curl -f http://localhost:8000/api/v1/metrics/community || { echo "❌ Metrics failed"; kill $API_PID; exit 1; }
echo "✅ Metrics retrieved"

# 8. Cleanup
echo "7️⃣ Cleaning up..."
kill $API_PID
echo "✅ API stopped"

echo "🎉 All tests passed!"
```

Save as `test_e2e.sh` and run:
```bash
chmod +x test_e2e.sh
./test_e2e.sh
```

---

## 8️⃣ Validation Criteria

### Performance Targets

| Metric | Target | Test |
|--------|--------|------|
| Solar Utilization | ≥87% | Test 22 |
| Cost Savings | ≥35% | Test 13 |
| Simulation Speed | <10s | Test 18 |
| API Response | <100ms | Test 19 |
| Memory Usage | <2GB | Test 20 |
| Data Generation | <60s | Test 21 |

### Functional Requirements

| Requirement | Test |
|-------------|------|
| Data generation works | Test 5 |
| Simulation runs | Test 6 |
| API starts | Test 7 |
| All endpoints respond | Tests 8-16 |
| WebSocket works | Test 17 |
| Scenarios execute | Tests 22-26 |
| Metrics calculate | Test 13 |

---

## 🐛 Troubleshooting Tests

### If Test Fails

1. **Check logs**: `tail -f logs/solar_swarm.log`
2. **Verify dependencies**: `pip list | grep -E "torch|pandas|fastapi"`
3. **Check ports**: `lsof -i :8000`
4. **Restart API**: Kill and restart
5. **Clear cache**: `rm -rf __pycache__ src/__pycache__`

### Common Issues

**Issue**: "Module not found"
```bash
pip install -r requirements.txt
```

**Issue**: "Port already in use"
```bash
lsof -ti:8000 | xargs kill -9
```

**Issue**: "Permission denied"
```bash
chmod +x test_e2e.sh
```

**Issue**: "API not responding"
```bash
# Check if running
ps aux | grep "python main.py api"

# Check logs
tail -f logs/solar_swarm.log
```

---

## ✅ Test Summary Template

After running all tests, fill this out:

```
SOLAR SWARM INTELLIGENCE - TEST RESULTS
========================================

Date: _______________
Tester: _______________

UNIT TESTS (Tests 1-4)
[ ] Configuration loading
[ ] Logger initialization
[ ] Data generator
[ ] Agent creation

INTEGRATION TESTS (Tests 5-7)
[ ] Data generation
[ ] Simulation execution
[ ] API startup

API TESTS (Tests 8-16)
[ ] Root endpoint
[ ] Simulation start
[ ] Simulation status
[ ] Get agents
[ ] Get specific agent
[ ] Community metrics
[ ] Scenarios
[ ] Forecast
[ ] History

WEBSOCKET TEST (Test 17)
[ ] Connection and streaming

PERFORMANCE TESTS (Tests 18-21)
[ ] Simulation speed: _____ seconds
[ ] API response: _____ ms
[ ] Memory usage: _____ MB
[ ] Data generation: _____ seconds

SCENARIO TESTS (Tests 22-26)
[ ] Sunny day
[ ] Cloudy day
[ ] Panel failure
[ ] Peak demand
[ ] Swarm vs individual

END-TO-END TEST (Test 27)
[ ] Complete workflow

OVERALL RESULT: _____ / 27 tests passed

NOTES:
_________________________________
_________________________________
_________________________________
```

---

## 🎯 Acceptance Criteria

**System is ready for deployment if**:

- ✅ All unit tests pass (4/4)
- ✅ All integration tests pass (3/3)
- ✅ All API tests pass (9/9)
- ✅ WebSocket test passes (1/1)
- ✅ Performance targets met (4/4)
- ✅ All scenarios pass (5/5)
- ✅ End-to-end test passes (1/1)

**Total**: 27/27 tests ✅

---

**Happy Testing! 🧪**
