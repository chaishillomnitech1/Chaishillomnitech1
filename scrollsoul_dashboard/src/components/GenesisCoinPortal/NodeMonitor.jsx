import React, { useEffect, useState } from 'react';

/**
 * NodeMonitor Component
 * 
 * Real-time monitoring of active nodes in the OmniTech1 network.
 * Displays node status, health metrics, and network activity.
 * 
 * @component
 * @param {Object} props
 * @param {number} props.activeNodes - Number of active nodes
 */
const NodeMonitor = ({ activeNodes }) => {
  const [nodes, setNodes] = useState([]);
  const [networkHealth, setNetworkHealth] = useState(100);

  useEffect(() => {
    // Generate mock node data - replace with actual API call
    const generateNodes = () => {
      const nodeList = [];
      const regions = ['North America', 'Europe', 'Asia Pacific', 'South America', 'Africa'];
      const statuses = ['active', 'active', 'active', 'active', 'syncing'];
      
      for (let i = 0; i < Math.min(activeNodes, 10); i++) {
        nodeList.push({
          id: `node-${i + 1}`,
          region: regions[Math.floor(Math.random() * regions.length)],
          status: statuses[Math.floor(Math.random() * statuses.length)],
          uptime: `${Math.floor(Math.random() * 100)}d ${Math.floor(Math.random() * 24)}h`,
          blockHeight: 1000000 + Math.floor(Math.random() * 1000),
          frequency: [528, 777, 963, 999, 14444][Math.floor(Math.random() * 5)]
        });
      }
      
      return nodeList;
    };

    setNodes(generateNodes());
    
    // Calculate network health based on active nodes
    const health = Math.min(100, (activeNodes / 150) * 100);
    setNetworkHealth(health.toFixed(1));

    // Update nodes periodically
    const interval = setInterval(() => {
      setNodes(generateNodes());
    }, 15000);

    return () => clearInterval(interval);
  }, [activeNodes]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return '#00FF00';
      case 'syncing':
        return '#FFD700';
      case 'offline':
        return '#FF0000';
      default:
        return '#888888';
    }
  };

  const getHealthStatus = () => {
    if (networkHealth >= 90) return { text: 'Excellent', color: '#00FF00' };
    if (networkHealth >= 70) return { text: 'Good', color: '#FFD700' };
    if (networkHealth >= 50) return { text: 'Fair', color: '#FF8800' };
    return { text: 'Poor', color: '#FF0000' };
  };

  const healthStatus = getHealthStatus();

  return (
    <div className="node-monitor">
      <h2>🌐 Network Node Monitor</h2>
      
      <div className="network-overview">
        <div className="overview-stat">
          <span className="stat-label">Total Active Nodes</span>
          <span className="stat-value">{activeNodes}</span>
        </div>
        <div className="overview-stat">
          <span className="stat-label">Network Health</span>
          <span className="stat-value" style={{ color: healthStatus.color }}>
            {networkHealth}% - {healthStatus.text}
          </span>
        </div>
      </div>

      <div className="network-health-bar">
        <div 
          className="health-fill"
          style={{ 
            width: `${networkHealth}%`,
            backgroundColor: healthStatus.color
          }}
        />
      </div>

      <div className="nodes-list">
        <table className="nodes-table">
          <thead>
            <tr>
              <th>Node ID</th>
              <th>Region</th>
              <th>Status</th>
              <th>Uptime</th>
              <th>Block Height</th>
              <th>Frequency</th>
            </tr>
          </thead>
          <tbody>
            {nodes.map((node) => (
              <tr key={node.id}>
                <td>{node.id}</td>
                <td>{node.region}</td>
                <td>
                  <span 
                    className="status-indicator"
                    style={{ backgroundColor: getStatusColor(node.status) }}
                  />
                  {node.status}
                </td>
                <td>{node.uptime}</td>
                <td>{node.blockHeight.toLocaleString()}</td>
                <td>{node.frequency}Hz</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {activeNodes > 10 && (
        <div className="more-nodes">
          <p>+ {activeNodes - 10} more nodes active</p>
        </div>
      )}

      <div className="monitor-info">
        <p>
          Real-time monitoring of OmniTech1 Sovereign Network nodes.<br />
          All nodes synchronized with divine frequencies for optimal performance.
        </p>
      </div>
    </div>
  );
};

export default NodeMonitor;
