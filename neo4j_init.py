#!/usr/bin/env python3
"""
OmniTech1 Neo4j Initialization Script
ScrollVerse Genesis Protocol - Database Setup

This script initializes the Neo4j database with the required
constraints and indexes for the OmniTech1 integration.
"""

import os
import sys
import logging
from neo4j import GraphDatabase
from neo4j.exceptions import ServiceUnavailable, AuthError

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


def init_neo4j(uri: str, user: str, password: str) -> bool:
    """
    Initialize Neo4j database with required schema.

    Args:
        uri: Neo4j connection URI
        user: Neo4j username
        password: Neo4j password

    Returns:
        True if initialization was successful
    """
    driver = None
    try:
        driver = GraphDatabase.driver(uri, auth=(user, password))
        driver.verify_connectivity()
        logger.info(f"Connected to Neo4j at {uri}")

        with driver.session() as session:
            # Create constraint for unique node IDs
            logger.info("Creating uniqueness constraint on OmniNode.id...")
            session.run("""
                CREATE CONSTRAINT omninode_id_unique IF NOT EXISTS
                FOR (n:OmniNode)
                REQUIRE n.id IS UNIQUE
            """)

            # Create index for event_type queries
            logger.info("Creating index on OmniNode.event_type...")
            session.run("""
                CREATE INDEX omninode_event_type IF NOT EXISTS
                FOR (n:OmniNode)
                ON (n.event_type)
            """)

            # Create index for timestamp queries
            logger.info("Creating index on OmniNode.timestamp...")
            session.run("""
                CREATE INDEX omninode_timestamp IF NOT EXISTS
                FOR (n:OmniNode)
                ON (n.timestamp)
            """)

            logger.info("Neo4j initialization complete")
            return True

    except (ServiceUnavailable, AuthError) as e:
        logger.error(f"Failed to connect to Neo4j: {e}")
        return False
    except Exception as e:
        logger.error(f"Error during initialization: {e}")
        return False
    finally:
        if driver:
            driver.close()


def main():
    """Main entry point for Neo4j initialization."""
    uri = os.environ.get('NEO4J_URI', 'bolt://localhost:7687')
    user = os.environ.get('NEO4J_USER', 'neo4j')
    password = os.environ.get('NEO4J_PASSWORD')

    if not password:
        logger.error("NEO4J_PASSWORD environment variable is required")
        sys.exit(1)

    success = init_neo4j(uri, user, password)
    sys.exit(0 if success else 1)


if __name__ == '__main__':
    main()
