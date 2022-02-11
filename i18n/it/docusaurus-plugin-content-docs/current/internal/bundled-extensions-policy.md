# Bundled Extensions Policy

This document is to assist in deciding what extensions should be bundled or maintained by the Flarum project team.

Understand that Flarum aims to have a lean and efficient team. To guarantee a transparent workload, we intentionally have a "this could be an extension" mentality. The acronym D.O.R.C. spells out our decision-making process.

- **Density**: prevent bloating Flarum so that it becomes a burden to install on shared hosting plans with limited space.
- **Opinionatedness**: no extensions should be bundled that is only useful by only a limited amount of communities or on specific hosting environments.
- **Responsibility**: extensions that could easily be maintained by others should be maintained by others.
- **Complexity**: extensions that are complex in terms of design, frontend or backend code should not be a responsibility of the Flarum project team.

### Density

To prevent the installation size of Flarum to continuously increasing we need to protect it from extensions that bloat it. We should ship extensions with Flarum that, for instance, have kilobytes in media files.

### Opinionatedness

Our goal is to allow installation of Flarum, in its vanilla form, by any community on any hosting environment. This includes shared hosting environment as well.

Releasing Flarum with extensions that add functionality specific to cloud based (AWS) installations or for corporate support communities, as such, is unwanted.

### Responsibility

Protecting the time of the project team is key. To do so we should empower the ecosystem in building extensions that it needs. Therefor we distance ourselves from the responsibility of building every and all extensions. The responsibility of extension development is held primarily by our community.
