# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-04-18

### Added
- Initial release of MagicMirror Admin Platform
- Angular 17 frontend with Material Design
- FastAPI backend with plugin architecture
- Plugin interface (TypeScript + Python ABC)
- NGINX reverse proxy configuration
- Setup Manager plugin (port of magicmirror-setup)
- Multilingual support (EN/DE)
- Docker support for local development
- GitHub Actions CI/CD pipeline
- One-line installation script
- Comprehensive documentation (README.md, ARCHITECTURE.md)

### Features
- **Plugin System**: Extensible architecture for modular functionality
- **Modern UI**: Angular 17 with standalone components and Material Design
- **REST API**: FastAPI with automatic OpenAPI documentation
- **Service Management**: Control MagicMirror and system services
- **Update Mechanism**: Automatic update checks and one-click updates
- **Security**: Minimal sudo rights, CORS protection, input validation
- **i18n**: Multi-language support with JSON translation files
- **Development Tools**: Docker Compose for local testing

## [Unreleased]

### Planned
- WLAN Manager plugin integration
- Module Manager plugin
- User authentication system
- WebSocket support for real-time updates
- Plugin marketplace
- GraphQL API option
- Advanced monitoring and logging
