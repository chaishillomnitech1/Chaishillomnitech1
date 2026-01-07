"""
Leadership AI - Historical Leader Analysis and Decision Support System

This module integrates AI capabilities to analyze leadership strategies,
provide decision-making support, and offer insights based on historical leaders.
"""

import json
import os
from datetime import datetime
from typing import Dict, List, Optional
import random


class LeadershipAI:
    """AI system for leadership analysis and recommendations"""
    
    def __init__(self, knowledge_base_path: str = "knowledge_base.json"):
        self.knowledge_base_path = knowledge_base_path
        self.leaders = {}
        self.strategies = {}
        self.decision_patterns = {}
        self.load_knowledge_base()
    
    def load_knowledge_base(self):
        """Load existing knowledge base or create default"""
        if os.path.exists(self.knowledge_base_path):
            try:
                with open(self.knowledge_base_path, 'r') as f:
                    data = json.load(f)
                    self.leaders = data.get('leaders', {})
                    self.strategies = data.get('strategies', {})
                    self.decision_patterns = data.get('decision_patterns', {})
            except json.JSONDecodeError as e:
                print(f"Warning: Knowledge base file is corrupted: {e}")
                print("Initializing with default knowledge...")
                self._initialize_default_knowledge()
                self.save_knowledge_base()
            except Exception as e:
                print(f"Error loading knowledge base: {e}")
                self._initialize_default_knowledge()
        else:
            self._initialize_default_knowledge()
            self.save_knowledge_base()
    
    def save_knowledge_base(self):
        """Save knowledge base to disk"""
        data = {
            'leaders': self.leaders,
            'strategies': self.strategies,
            'decision_patterns': self.decision_patterns,
            'last_updated': datetime.now().isoformat()
        }
        with open(self.knowledge_base_path, 'w') as f:
            json.dump(data, f, indent=2)
    
    def _initialize_default_knowledge(self):
        """Initialize with historical leader knowledge"""
        self.leaders = {
            "alexander_the_great": {
                "name": "Alexander the Great",
                "era": "356-323 BC",
                "domain": "Military Leadership",
                "key_traits": ["decisive", "strategic", "inspirational", "bold"],
                "achievements": [
                    "Conquered Persian Empire",
                    "Never lost a battle",
                    "Created one of largest empires in history"
                ],
                "leadership_style": "Lead from the front, inspire through personal example",
                "decision_philosophy": "Analyze quickly, decide decisively, act immediately"
            },
            "marcus_aurelius": {
                "name": "Marcus Aurelius",
                "era": "121-180 AD",
                "domain": "Philosophical Leadership",
                "key_traits": ["wise", "stoic", "disciplined", "just"],
                "achievements": [
                    "Philosopher-King of Rome",
                    "Maintained empire stability",
                    "Wrote Meditations"
                ],
                "leadership_style": "Lead through wisdom and self-mastery",
                "decision_philosophy": "Act according to reason and virtue"
            },
            "saladin": {
                "name": "Saladin",
                "era": "1137-1193 AD",
                "domain": "Military & Diplomatic Leadership",
                "key_traits": ["honorable", "strategic", "diplomatic", "unifying"],
                "achievements": [
                    "United Muslim territories",
                    "Recaptured Jerusalem",
                    "Demonstrated exemplary chivalry"
                ],
                "leadership_style": "Unite through respect and honor",
                "decision_philosophy": "Balance strength with mercy"
            },
            "genghis_khan": {
                "name": "Genghis Khan",
                "era": "1162-1227 AD",
                "domain": "Empire Building",
                "key_traits": ["adaptive", "strategic", "ruthless", "innovative"],
                "achievements": [
                    "Founded Mongol Empire",
                    "Implemented meritocracy",
                    "Facilitated Silk Road trade"
                ],
                "leadership_style": "Reward merit, punish failure",
                "decision_philosophy": "Adapt or perish"
            },
            "napoleon_bonaparte": {
                "name": "Napoleon Bonaparte",
                "era": "1769-1821 AD",
                "domain": "Military & Administrative Genius",
                "key_traits": ["brilliant", "ambitious", "reformer", "tactical"],
                "achievements": [
                    "Napoleonic Code",
                    "Revolutionary military tactics",
                    "Reformed French institutions"
                ],
                "leadership_style": "Lead through competence and vision",
                "decision_philosophy": "Concentrate force at decisive point"
            }
        }
        
        self.strategies = {
            "decisive_action": {
                "name": "Decisive Action Protocol",
                "description": "Make rapid decisions with full commitment",
                "when_to_use": "Time-sensitive situations requiring immediate action",
                "steps": [
                    "Gather essential information quickly",
                    "Analyze core factors",
                    "Make clear decision",
                    "Execute with full force",
                    "Adjust based on results"
                ],
                "historical_examples": ["alexander_the_great", "napoleon_bonaparte"]
            },
            "adaptive_strategy": {
                "name": "Adaptive Strategy Framework",
                "description": "Maintain core principles while adapting tactics",
                "when_to_use": "Changing environments requiring flexibility",
                "steps": [
                    "Identify unchanging principles",
                    "Monitor environmental changes",
                    "Adjust tactics accordingly",
                    "Preserve strategic vision",
                    "Learn from adaptations"
                ],
                "historical_examples": ["genghis_khan", "saladin"]
            },
            "philosophical_leadership": {
                "name": "Wisdom-Based Leadership",
                "description": "Lead through wisdom and self-mastery",
                "when_to_use": "Long-term governance requiring stability",
                "steps": [
                    "Cultivate self-discipline",
                    "Act according to principles",
                    "Consider long-term consequences",
                    "Lead by example",
                    "Maintain equanimity"
                ],
                "historical_examples": ["marcus_aurelius"]
            }
        }
    
    def analyze_situation(self, situation: Dict) -> Dict:
        """
        Analyze a situation and provide AI-powered recommendations
        
        Args:
            situation: Dict with keys: 'description', 'urgency', 'complexity', 'resources'
        
        Returns:
            Dict with recommendations and relevant historical insights
        """
        urgency = situation.get('urgency', 'medium')
        complexity = situation.get('complexity', 'medium')
        
        # Select appropriate strategy
        if urgency == 'high':
            recommended_strategy = 'decisive_action'
        elif complexity == 'high':
            recommended_strategy = 'adaptive_strategy'
        else:
            recommended_strategy = 'philosophical_leadership'
        
        strategy = self.strategies.get(recommended_strategy, {})
        
        # Get relevant leader insights
        relevant_leaders = strategy.get('historical_examples', [])
        leader_insights = [
            {
                'name': self.leaders[leader_id]['name'],
                'philosophy': self.leaders[leader_id]['decision_philosophy'],
                'style': self.leaders[leader_id]['leadership_style']
            }
            for leader_id in relevant_leaders if leader_id in self.leaders
        ]
        
        return {
            'analysis': {
                'situation_type': f"{urgency} urgency, {complexity} complexity",
                'recommended_approach': strategy.get('name'),
                'reasoning': strategy.get('description')
            },
            'strategy': strategy,
            'leader_insights': leader_insights,
            'action_steps': strategy.get('steps', []),
            'confidence': 0.85,
            'timestamp': datetime.now().isoformat()
        }
    
    def get_leader_wisdom(self, leader_id: Optional[str] = None) -> Dict:
        """Get wisdom from a specific leader or random leader"""
        if leader_id and leader_id in self.leaders:
            leader = self.leaders[leader_id]
        else:
            leader_id = random.choice(list(self.leaders.keys()))
            leader = self.leaders[leader_id]
        
        return {
            'leader': leader['name'],
            'era': leader['era'],
            'philosophy': leader['decision_philosophy'],
            'style': leader['leadership_style'],
            'key_traits': leader['key_traits'],
            'wisdom_applied': self._generate_wisdom_application(leader)
        }
    
    def _generate_wisdom_application(self, leader: Dict) -> str:
        """Generate applicable wisdom from leader profile"""
        name = leader['name']
        philosophy = leader['decision_philosophy']
        
        applications = [
            f"When facing challenges, remember {name}'s principle: '{philosophy}'",
            f"Apply {name}'s approach of {leader['leadership_style'].lower()}",
            f"Channel {name}'s traits: {', '.join(leader['key_traits'][:3])}"
        ]
        
        return random.choice(applications)
    
    def recommend_for_workflow(self, workflow_type: str) -> Dict:
        """Provide AI recommendations for ScrollVerse workflow decisions"""
        workflow_recommendations = {
            'deployment': {
                'approach': 'decisive_action',
                'leader_model': 'napoleon_bonaparte',
                'guidance': 'Execute deployments with precision and speed, like Napoleon\'s military campaigns',
                'checks': [
                    'Verify all contracts compiled',
                    'Confirm network parameters',
                    'Execute deployment decisively',
                    'Monitor results immediately',
                    'Document outcomes'
                ]
            },
            'governance': {
                'approach': 'philosophical_leadership',
                'leader_model': 'marcus_aurelius',
                'guidance': 'Govern with wisdom and consideration for long-term impact',
                'checks': [
                    'Consider all stakeholder perspectives',
                    'Evaluate long-term consequences',
                    'Maintain alignment with core principles',
                    'Lead by example',
                    'Document decision rationale'
                ]
            },
            'expansion': {
                'approach': 'adaptive_strategy',
                'leader_model': 'genghis_khan',
                'guidance': 'Expand systematically while adapting to new territories',
                'checks': [
                    'Assess new opportunities',
                    'Maintain core infrastructure',
                    'Adapt strategies to context',
                    'Build scalable systems',
                    'Preserve organizational culture'
                ]
            }
        }
        
        recommendation = workflow_recommendations.get(
            workflow_type,
            workflow_recommendations['governance']
        )
        
        # Add leader details
        leader_id = recommendation['leader_model']
        if leader_id in self.leaders:
            recommendation['leader_details'] = self.leaders[leader_id]
        
        return recommendation
    
    def track_decision(self, decision: Dict):
        """Track a decision for learning and pattern recognition"""
        decision_id = datetime.now().isoformat()
        
        self.decision_patterns[decision_id] = {
            'decision': decision.get('description'),
            'strategy_used': decision.get('strategy'),
            'outcome': decision.get('outcome', 'pending'),
            'timestamp': decision_id
        }
        
        self.save_knowledge_base()
        
        return decision_id
    
    def get_decision_insights(self) -> Dict:
        """Analyze historical decisions for patterns"""
        if not self.decision_patterns:
            return {
                'total_decisions': 0,
                'patterns': [],
                'recommendation': 'Start tracking decisions to build insights'
            }
        
        total = len(self.decision_patterns)
        strategies_used = {}
        
        for decision in self.decision_patterns.values():
            strategy = decision.get('strategy_used', 'unknown')
            strategies_used[strategy] = strategies_used.get(strategy, 0) + 1
        
        return {
            'total_decisions': total,
            'strategy_distribution': strategies_used,
            'most_used_strategy': max(strategies_used.items(), key=lambda x: x[1])[0] if strategies_used else None,
            'recommendation': 'Continue building decision history for deeper insights'
        }


def main():
    """CLI interface for Leadership AI"""
    ai = LeadershipAI()
    
    print("🧠 Leadership AI - ScrollVerse Decision Support System")
    print("=" * 60)
    
    # Example usage
    print("\n📊 Analyzing a deployment situation...")
    situation = {
        'description': 'Deploy new smart contract to mainnet',
        'urgency': 'high',
        'complexity': 'medium',
        'resources': 'adequate'
    }
    
    analysis = ai.analyze_situation(situation)
    print(f"\n✨ Recommended Approach: {analysis['analysis']['recommended_approach']}")
    print(f"📝 Reasoning: {analysis['analysis']['reasoning']}")
    print(f"\n🎯 Action Steps:")
    for i, step in enumerate(analysis['action_steps'], 1):
        print(f"  {i}. {step}")
    
    print(f"\n👑 Leader Insights:")
    for insight in analysis['leader_insights']:
        print(f"  • {insight['name']}: {insight['philosophy']}")
    
    print("\n" + "=" * 60)
    print("\n🌟 Getting wisdom from historical leaders...")
    wisdom = ai.get_leader_wisdom()
    print(f"\n👑 {wisdom['leader']} ({wisdom['era']})")
    print(f"💡 {wisdom['wisdom_applied']}")
    
    print("\n" + "=" * 60)
    print("\n🔄 Workflow Recommendation for Deployment...")
    workflow_rec = ai.recommend_for_workflow('deployment')
    print(f"\n📋 Guidance: {workflow_rec['guidance']}")
    print(f"\n✅ Deployment Checklist:")
    for i, check in enumerate(workflow_rec['checks'], 1):
        print(f"  {i}. {check}")
    
    print("\n" + "=" * 60)
    print("✓ Leadership AI initialized successfully")
    print(f"✓ Knowledge base: {len(ai.leaders)} leaders, {len(ai.strategies)} strategies")


if __name__ == "__main__":
    main()
