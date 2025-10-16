import numpy as np

class SolarPanelAgent:
    """
    Basic solar panel agent with rule-based decision making
    """
    
    def __init__(self, agent_id, battery_capacity=10):
        self.id = agent_id
        self.battery_capacity = battery_capacity  # kWh
        self.battery_level = battery_capacity * 0.5  # Start at 50%
        self.production = 0
        self.consumption = 0
        self.neighbors = []
        self.messages = []
    
    def update_state(self, production, consumption):
        """
        Update current production and consumption
        """
        self.production = production
        self.consumption = consumption
    
    def calculate_excess(self):
        """
        Calculate excess energy available for sharing
        """
        net_production = self.production - self.consumption
        
        if net_production > 0 and self.battery_level > 0.7 * self.battery_capacity:
            # Have excess and battery is sufficiently charged
            return net_production
        return 0
    
    def calculate_needs(self):
        """
        Calculate energy deficit
        """
        net_production = self.production - self.consumption
        
        if net_production < 0:
            return abs(net_production)
        elif self.battery_level < 0.3 * self.battery_capacity:
            # Battery low, need charging
            return (0.5 * self.battery_capacity) - self.battery_level
        return 0
    
    def make_decision(self):
        """
        Rule-based decision making
        """
        excess = self.calculate_excess()
        needs = self.calculate_needs()
        
        # Priority 1: Meet own needs
        if needs > 0:
            if self.production > self.consumption:
                # Charge own battery
                charge_amount = min(needs, self.production - self.consumption)
                self.battery_level += charge_amount
                return {'action': 'charge_battery', 'amount': charge_amount}
            else:
                # Need to buy from neighbors or grid
                return {'action': 'request_energy', 'amount': needs}
        
        # Priority 2: Share with neighbors
        elif excess > 2:  # Threshold: 2 kWh minimum to share
            # Check if any neighbor needs energy
            for neighbor in self.neighbors:
                if neighbor.calculate_needs() > 0:
                    share_amount = min(excess, neighbor.calculate_needs())
                    return {
                        'action': 'share_energy',
                        'target': neighbor.id,
                        'amount': share_amount
                    }
        
        # Priority 3: Store in battery
        elif self.battery_level < 0.9 * self.battery_capacity:
            charge_amount = min(
                excess,
                (0.9 * self.battery_capacity) - self.battery_level
            )
            self.battery_level += charge_amount
            return {'action': 'charge_battery', 'amount': charge_amount}
        
        # Priority 4: Sell to grid
        else:
            return {'action': 'sell_to_grid', 'amount': excess}
    
    def communicate(self):
        """
        Broadcast status to neighbors
        """
        message = {
            'from': self.id,
            'battery': self.battery_level / self.battery_capacity,
            'excess': self.calculate_excess(),
            'needs': self.calculate_needs(),
            'timestamp': 'now'
        }
        return message
    
    def receive_message(self, message):
        """
        Receive message from another agent
        """
        self.messages.append(message)


# Neighborhood Simulation
class SwarmSimulator:
    """
    Simulate community of solar panel agents
    """
    
    def __init__(self, num_agents=10):
        self.agents = [SolarPanelAgent(i) for i in range(num_agents)]
        self.connect_neighbors()
        self.time_step = 0
        self.results = {
            'solar_used': [],
            'grid_import': [],
            'shared_energy': []
        }
    
    def connect_neighbors(self):
        """
        Create neighborhood topology (each agent connected to 3-5 neighbors)
        """
        for i, agent in enumerate(self.agents):
            # Connect to 3 nearest neighbors
            neighbors = [
                self.agents[j] for j in range(len(self.agents))
                if j != i and abs(j - i) <= 2
            ]
            agent.neighbors = neighbors
    
    def simulate_production(self, hour):
        """
        Simulate solar production based on time of day
        """
        # Simple sinusoidal pattern (peak at noon)
        if 6 <= hour <= 18:  # Daylight hours
            base_production = 5 * np.sin((hour - 6) * np.pi / 12)
            # Add some randomness
            return max(0, base_production + np.random.normal(0, 0.5))
        return 0
    
    def simulate_consumption(self, hour):
        """
        Simulate household consumption
        """
        # Peak in morning and evening
        if 6 <= hour <= 9 or 18 <= hour <= 22:
            return np.random.uniform(2, 4)
        elif 9 < hour < 18:
            return np.random.uniform(1, 2)
        else:
            return np.random.uniform(0.5, 1)
    
    def run_timestep(self, hour):
        """
        Run one simulation timestep
        """
        # Update all agents with current production/consumption
        for agent in self.agents:
            production = self.simulate_production(hour)
            consumption = self.simulate_consumption(hour)
            agent.update_state(production, consumption)
        
        # Agents communicate
        messages = []
        for agent in self.agents:
            msg = agent.communicate()
            messages.append(msg)
        
        # Broadcast messages
        for agent in self.agents:
            for msg in messages:
                if msg['from'] != agent.id:
                    agent.receive_message(msg)
        
        # Agents make decisions
        total_shared = 0
        total_solar = 0
        total_grid = 0
        
        for agent in self.agents:
            decision = agent.make_decision()
            
            if decision['action'] == 'share_energy':
                total_shared += decision['amount']
            
            total_solar += min(agent.production, agent.consumption)
            
            if agent.consumption > agent.production:
                total_grid += agent.consumption - agent.production
        
        # Record results
        self.results['shared_energy'].append(total_shared)
        self.results['solar_used'].append(total_solar)
        self.results['grid_import'].append(total_grid)
    
    def run(self, hours=24):
        """
        Run full simulation
        """
        for hour in range(hours):
            self.run_timestep(hour)
            self.time_step += 1
        
        # Calculate metrics
        total_consumption = sum(self.results['solar_used']) + sum(self.results['grid_import'])
        solar_pct = (sum(self.results['solar_used']) / total_consumption) * 100
        
        print(f"\n📊 Simulation Results ({hours} hours):")
        print(f"  Solar Usage: {solar_pct:.1f}%")
        print(f"  Grid Import: {100-solar_pct:.1f}%")
        print(f"  Energy Shared: {sum(self.results['shared_energy']):.1f} kWh")
        print(f"  Total Transfers: {len([x for x in self.results['shared_energy'] if x > 0])}")
        
        return self.results


# Usage example
if __name__ == "__main__":
    print("🐝 Starting Solar Swarm Simulation...")
    
    simulator = SwarmSimulator(num_agents=10)
    results = simulator.run(hours=24)
    
    print("\n✅ Simulation complete!")
