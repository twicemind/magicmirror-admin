# Contributing to MagicMirror Admin Platform

Thank you for your interest in contributing! 🎉

## Development Setup

1. **Fork and Clone**
   ```bash
   git clone https://github.com/YOUR_USERNAME/magicmirror-admin.git
   cd magicmirror-admin
   ```

2. **Backend Setup**
   ```bash
   cd backend
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   ```

4. **Run Development Servers**
   ```bash
   # From project root
   bash scripts/dev-start.sh
   ```

## Creating a Plugin

See [Plugin Development Guide](ARCHITECTURE.md#plugin-development) in ARCHITECTURE.md.

## Code Style

- **Python**: Follow PEP 8, use Black for formatting
- **TypeScript**: Follow Angular style guide
- **Commits**: Use conventional commits (feat:, fix:, docs:, etc.)

## Pull Request Process

1. Create a feature branch: `git checkout -b feature/my-feature`
2. Make your changes
3. Test thoroughly
4. Commit with clear messages
5. Push and create a Pull Request
6. Wait for review

## Testing

```bash
# Backend tests
cd backend
pytest

# Frontend tests
cd frontend
npm test
```

## Questions?

Open an issue or discussion on GitHub!
