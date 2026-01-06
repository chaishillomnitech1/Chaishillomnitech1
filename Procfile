# OmniTech1 Integration - Heroku Procfile
# ScrollVerse Genesis Protocol - Process Types

web: python -c "import eventlet; eventlet.monkey_patch(); from omnitech_server import socketio, app; socketio.run(app, host='0.0.0.0', port=int(__import__('os').environ.get('PORT', 5000)))"
