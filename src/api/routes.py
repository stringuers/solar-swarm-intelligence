"""
API Routes
All REST endpoints for the Solar Swarm Intelligence system
"""

from fastapi import APIRouter, HTTPException, BackgroundTasks
from typing import List, Optional
from datetime import datetime
import asyncio

from .schemas import (
    SimulationStatus,
    SimulationStartRequest,
    AgentInfo,
    CommunityMetrics,
    ScenarioRequest,
    ForecastResponse
)
from ..agents.base_agent import SwarmSimulator
from ..utils.metrics import PerformanceEvaluator
from ..utils.logger import logger

router = APIRouter()

# Global simulation state
current_simulation = None
simulation_running = False

@router.get("/simulation/status", response_model=SimulationStatus)
async def get_simulation_status():
    """Get current simulation status"""
    global current_simulation, simulation_running
    
    if current_simulation is None:
        return SimulationStatus(
            status="idle",
            current_hour=0,
            total_hours=24,
            agents_active=0,
            message="No simulation running"
        )
    
    return SimulationStatus(
        status="running" if simulation_running else "completed",
        current_hour=current_simulation.time_step,
        total_hours=24,
        agents_active=len(current_simulation.agents),
        message=f"Simulation at hour {current_simulation.time_step}/24"
    )

@router.post("/simulation/start")
async def start_simulation(request: SimulationStartRequest, background_tasks: BackgroundTasks):
    """Start a new simulation"""
    global current_simulation, simulation_running
    
    if simulation_running:
        raise HTTPException(status_code=400, detail="Simulation already running")
    
    logger.info(f"Starting simulation with {request.num_agents} agents for {request.hours} hours")
    
    # Create simulator
    current_simulation = SwarmSimulator(num_agents=request.num_agents)
    simulation_running = True
    
    # Run simulation in background
    background_tasks.add_task(run_simulation_background, request.hours)
    
    return {
        "message": "Simulation started",
        "num_agents": request.num_agents,
        "hours": request.hours
    }

async def run_simulation_background(hours: int):
    """Run simulation in background"""
    global current_simulation, simulation_running
    
    try:
        results = current_simulation.run(hours=hours)
        logger.info(f"Simulation completed: {results}")
    except Exception as e:
        logger.error(f"Simulation error: {e}")
    finally:
        simulation_running = False

@router.post("/simulation/stop")
async def stop_simulation():
    """Stop current simulation"""
    global simulation_running
    
    if not simulation_running:
        raise HTTPException(status_code=400, detail="No simulation running")
    
    simulation_running = False
    logger.info("Simulation stopped by user")
    
    return {"message": "Simulation stopped"}

@router.get("/agents", response_model=List[AgentInfo])
async def get_all_agents():
    """Get information about all agents"""
    global current_simulation
    
    if current_simulation is None:
        raise HTTPException(status_code=404, detail="No simulation available")
    
    agents_info = []
    for agent in current_simulation.agents:
        agents_info.append(AgentInfo(
            id=agent.id,
            battery_level=agent.battery_level,
            battery_capacity=agent.battery_capacity,
            production=agent.production,
            consumption=agent.consumption,
            status="surplus" if agent.production > agent.consumption else "deficit",
            neighbors=[n.id for n in agent.neighbors]
        ))
    
    return agents_info

@router.get("/agents/{agent_id}", response_model=AgentInfo)
async def get_agent(agent_id: int):
    """Get information about a specific agent"""
    global current_simulation
    
    if current_simulation is None:
        raise HTTPException(status_code=404, detail="No simulation available")
    
    if agent_id >= len(current_simulation.agents):
        raise HTTPException(status_code=404, detail="Agent not found")
    
    agent = current_simulation.agents[agent_id]
    
    return AgentInfo(
        id=agent.id,
        battery_level=agent.battery_level,
        battery_capacity=agent.battery_capacity,
        production=agent.production,
        consumption=agent.consumption,
        status="surplus" if agent.production > agent.consumption else "deficit",
        neighbors=[n.id for n in agent.neighbors]
    )

@router.get("/metrics/community", response_model=CommunityMetrics)
async def get_community_metrics():
    """Get community-wide performance metrics"""
    global current_simulation
    
    if current_simulation is None or not current_simulation.results['solar_used']:
        raise HTTPException(status_code=404, detail="No simulation data available")
    
    evaluator = PerformanceEvaluator()
    
    # Prepare results for evaluation
    results = {
        'production': [agent.production for agent in current_simulation.agents] * current_simulation.time_step,
        'consumption': [agent.consumption for agent in current_simulation.agents] * current_simulation.time_step,
        'solar_used': current_simulation.results['solar_used'],
        'grid_import': current_simulation.results['grid_import'],
        'energy_shared': current_simulation.results['shared_energy']
    }
    
    energy_metrics = evaluator.calculate_energy_metrics(results)
    economic_metrics = evaluator.calculate_economic_metrics(results)
    environmental_metrics = evaluator.calculate_environmental_impact(results)
    
    return CommunityMetrics(
        solar_utilization_pct=energy_metrics['solar_utilization_pct'],
        self_sufficiency_pct=energy_metrics['self_sufficiency_pct'],
        grid_dependency_pct=energy_metrics['grid_dependency_pct'],
        energy_shared_kwh=sum(results['energy_shared']),
        cost_savings_daily=economic_metrics['daily_savings'],
        cost_savings_monthly=economic_metrics['monthly_savings'],
        co2_avoided_kg=environmental_metrics['daily_co2_avoided_kg'],
        trees_equivalent=environmental_metrics['trees_equivalent']
    )

@router.post("/scenario/run")
async def run_scenario(scenario: ScenarioRequest):
    """Run a specific scenario simulation"""
    global current_simulation
    
    logger.info(f"Running scenario: {scenario.scenario_type}")
    
    # Create new simulator
    simulator = SwarmSimulator(num_agents=50)
    
    # Apply scenario modifications
    if scenario.scenario_type == "cloudy_day":
        # Reduce production by 70%
        for agent in simulator.agents:
            agent.production *= 0.3
    
    elif scenario.scenario_type == "panel_failure":
        # Fail 5 random panels
        import random
        failed_agents = random.sample(range(len(simulator.agents)), 5)
        for idx in failed_agents:
            simulator.agents[idx].production = 0
    
    elif scenario.scenario_type == "peak_demand":
        # Increase consumption by 100%
        for agent in simulator.agents:
            agent.consumption *= 2.0
    
    elif scenario.scenario_type == "custom":
        # Apply custom parameters
        if scenario.parameters:
            production_factor = scenario.parameters.get('production_factor', 1.0)
            consumption_factor = scenario.parameters.get('consumption_factor', 1.0)
            
            for agent in simulator.agents:
                agent.production *= production_factor
                agent.consumption *= consumption_factor
    
    # Run simulation
    results = simulator.run(hours=24)
    
    # Calculate metrics
    evaluator = PerformanceEvaluator()
    metrics_data = {
        'production': [agent.production for agent in simulator.agents] * 24,
        'consumption': [agent.consumption for agent in simulator.agents] * 24,
        'solar_used': results['solar_used'],
        'grid_import': results['grid_import'],
        'energy_shared': results['shared_energy']
    }
    
    energy_metrics = evaluator.calculate_energy_metrics(metrics_data)
    
    return {
        "scenario": scenario.scenario_type,
        "results": {
            "solar_utilization": energy_metrics['solar_utilization_pct'],
            "grid_dependency": energy_metrics['grid_dependency_pct'],
            "energy_shared": sum(results['shared_energy']),
            "total_solar_used": sum(results['solar_used']),
            "total_grid_import": sum(results['grid_import'])
        }
    }

@router.get("/forecast/24h", response_model=ForecastResponse)
async def get_forecast():
    """Get 24-hour solar production forecast"""
    # This would use the trained LSTM/Prophet model
    # For now, return mock data
    
    import numpy as np
    from datetime import datetime, timedelta
    
    now = datetime.now()
    timestamps = [now + timedelta(hours=i) for i in range(24)]
    
    # Generate realistic forecast pattern
    forecast = []
    for i, ts in enumerate(timestamps):
        hour = ts.hour
        if 6 <= hour <= 18:
            production = 5 * np.sin((hour - 6) * np.pi / 12)
        else:
            production = 0
        
        forecast.append({
            "timestamp": ts.isoformat(),
            "predicted_kwh": round(production, 2),
            "confidence_lower": round(production * 0.9, 2),
            "confidence_upper": round(production * 1.1, 2)
        })
    
    return ForecastResponse(
        forecast_horizon_hours=24,
        model_type="LSTM",
        forecast=forecast
    )

@router.get("/metrics/history")
async def get_metrics_history(hours: int = 24):
    """Get historical metrics"""
    global current_simulation
    
    if current_simulation is None:
        raise HTTPException(status_code=404, detail="No simulation data")
    
    return {
        "hours": hours,
        "solar_used": current_simulation.results['solar_used'][-hours:],
        "grid_import": current_simulation.results['grid_import'][-hours:],
        "energy_shared": current_simulation.results['shared_energy'][-hours:]
    }
