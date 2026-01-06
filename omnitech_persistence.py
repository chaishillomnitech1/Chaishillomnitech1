#!/usr/bin/env python3
"""
OmniTech1 Neo4j Persistence Adapter
ScrollVerse Genesis Protocol - Graph Persistence Layer

This module provides Neo4j persistence for the OmniTech1 integration,
allowing the in-memory NetworkX graph to be persisted to Neo4j.
"""

import logging
from typing import Dict, Any, Optional, List

from neo4j import GraphDatabase
from neo4j.exceptions import ServiceUnavailable, AuthError

logger = logging.getLogger(__name__)


class OmnitechPersistence:
    """
    Neo4j persistence adapter for OmniTech1 graph data.

    Provides methods to save and retrieve nodes and edges from Neo4j,
    enabling persistence of the in-memory NetworkX graph.
    """

    def __init__(self, uri: str, user: str, password: str):
        """
        Initialize the Neo4j connection.

        Args:
            uri: Neo4j connection URI (e.g., 'bolt://localhost:7687')
            user: Neo4j username
            password: Neo4j password
        """
        self._uri = uri
        self._user = user
        self._password = password
        self._driver = None
        self._connect()

    def _connect(self) -> None:
        """Establish connection to Neo4j."""
        try:
            self._driver = GraphDatabase.driver(
                self._uri,
                auth=(self._user, self._password)
            )
            # Verify connectivity
            self._driver.verify_connectivity()
            logger.info(f"Connected to Neo4j at {self._uri}")
        except (ServiceUnavailable, AuthError) as e:
            logger.error(f"Failed to connect to Neo4j: {e}")
            self._driver = None
            raise

    def is_connected(self) -> bool:
        """Check if the Neo4j connection is active."""
        if self._driver is None:
            return False
        try:
            self._driver.verify_connectivity()
            return True
        except Exception:
            return False

    def close(self) -> None:
        """Close the Neo4j connection."""
        if self._driver:
            self._driver.close()
            self._driver = None
            logger.info("Neo4j connection closed")

    def save_node(self, node_id: str, attributes: Dict[str, Any]) -> bool:
        """
        Save a node to Neo4j.

        Args:
            node_id: Unique identifier for the node
            attributes: Dictionary of node attributes

        Returns:
            True if successful, False otherwise
        """
        if not self._driver:
            logger.warning("No Neo4j connection - node not persisted")
            return False

        try:
            with self._driver.session() as session:
                # Sanitize attributes for Neo4j (convert complex types to strings)
                safe_attrs = {
                    k: str(v) if not isinstance(v, (str, int, float, bool)) else v
                    for k, v in attributes.items()
                }

                query = """
                MERGE (n:OmniNode {id: $node_id})
                SET n += $attributes
                RETURN n
                """
                session.run(query, node_id=node_id, attributes=safe_attrs)
                logger.debug(f"Saved node: {node_id}")
                return True
        except Exception as e:
            logger.error(f"Failed to save node {node_id}: {e}")
            return False

    def save_edge(self, source: str, target: str, attributes: Dict[str, Any]) -> bool:
        """
        Save an edge to Neo4j.

        Args:
            source: Source node ID
            target: Target node ID
            attributes: Dictionary of edge attributes

        Returns:
            True if successful, False otherwise
        """
        if not self._driver:
            logger.warning("No Neo4j connection - edge not persisted")
            return False

        try:
            with self._driver.session() as session:
                # Sanitize attributes for Neo4j
                safe_attrs = {
                    k: str(v) if not isinstance(v, (str, int, float, bool)) else v
                    for k, v in attributes.items()
                }

                query = """
                MATCH (s:OmniNode {id: $source})
                MATCH (t:OmniNode {id: $target})
                MERGE (s)-[r:CONNECTED]->(t)
                SET r += $attributes
                RETURN r
                """
                session.run(query, source=source, target=target, attributes=safe_attrs)
                logger.debug(f"Saved edge: {source} -> {target}")
                return True
        except Exception as e:
            logger.error(f"Failed to save edge {source} -> {target}: {e}")
            return False

    def get_all_nodes(self) -> List[Dict[str, Any]]:
        """
        Retrieve all nodes from Neo4j.

        Returns:
            List of node dictionaries with 'id' and attributes
        """
        if not self._driver:
            return []

        try:
            with self._driver.session() as session:
                query = "MATCH (n:OmniNode) RETURN n"
                result = session.run(query)
                nodes = []
                for record in result:
                    node = dict(record['n'])
                    nodes.append(node)
                return nodes
        except Exception as e:
            logger.error(f"Failed to get nodes: {e}")
            return []

    def get_all_edges(self) -> List[Dict[str, Any]]:
        """
        Retrieve all edges from Neo4j.

        Returns:
            List of edge dictionaries with 'source', 'target', and attributes
        """
        if not self._driver:
            return []

        try:
            with self._driver.session() as session:
                query = """
                MATCH (s:OmniNode)-[r:CONNECTED]->(t:OmniNode)
                RETURN s.id as source, t.id as target, properties(r) as attrs
                """
                result = session.run(query)
                edges = []
                for record in result:
                    edge = {
                        'source': record['source'],
                        'target': record['target'],
                        **record['attrs']
                    }
                    edges.append(edge)
                return edges
        except Exception as e:
            logger.error(f"Failed to get edges: {e}")
            return []

    def clear_all(self) -> bool:
        """
        Clear all OmniNode data from Neo4j.

        Returns:
            True if successful, False otherwise
        """
        if not self._driver:
            return False

        try:
            with self._driver.session() as session:
                query = "MATCH (n:OmniNode) DETACH DELETE n"
                session.run(query)
                logger.info("Cleared all OmniNode data")
                return True
        except Exception as e:
            logger.error(f"Failed to clear data: {e}")
            return False

    def __enter__(self):
        """Context manager entry."""
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        """Context manager exit."""
        self.close()
