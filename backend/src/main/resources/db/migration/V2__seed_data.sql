-- Core Reference Data: Roles, Project Categories, and Skills

INSERT INTO roles (name, description) VALUES
('ROLE_CLIENT', 'Client account that posts projects and hires freelancers'),
('ROLE_FREELANCER', 'Freelancer account that builds portfolios and submits proposals'),
('ROLE_ADMIN', 'Platform administrator with moderation and analytics access');

INSERT INTO project_categories (name, slug, description, icon, active) VALUES
('Web Development', 'web-development', 'Full-stack web apps, APIs, e-commerce, and SaaS platforms', 'Code2', TRUE),
('Mobile App Development', 'mobile-app-development', 'iOS, Android, React Native, and Flutter applications', 'Smartphone', TRUE),
('UI/UX Design', 'ui-ux-design', 'Product design, Figma prototypes, design systems, and branding', 'Palette', TRUE),
('Data Science & AI', 'data-science-ai', 'Machine learning, analytics pipelines, LLM integrations, and BI', 'BrainCircuit', TRUE),
('DevOps & Cloud', 'devops-cloud', 'AWS, Kubernetes, CI/CD automation, and cloud architecture', 'Cloud', TRUE),
('Content & Copywriting', 'content-copywriting', 'Technical writing, SEO content, product copy, and documentation', 'PenTool', TRUE),
('Digital Marketing', 'digital-marketing', 'Growth campaigns, paid acquisition, analytics, and social strategy', 'Megaphone', TRUE),
('Cybersecurity & QA', 'cybersecurity-qa', 'Security audits, penetration testing, and automated QA suites', 'ShieldCheck', TRUE);

INSERT INTO skills (name, slug, category_hint) VALUES
('Java', 'java', 'Web Development'),
('Spring Boot', 'spring-boot', 'Web Development'),
('React', 'react', 'Web Development'),
('TypeScript', 'typescript', 'Web Development'),
('JavaScript', 'javascript', 'Web Development'),
('Node.js', 'node-js', 'Web Development'),
('Python', 'python', 'Data Science & AI'),
('MySQL', 'mysql', 'Web Development'),
('PostgreSQL', 'postgresql', 'Web Development'),
('Tailwind CSS', 'tailwind-css', 'UI/UX Design'),
('Figma', 'figma', 'UI/UX Design'),
('Flutter', 'flutter', 'Mobile App Development'),
('React Native', 'react-native', 'Mobile App Development'),
('Docker', 'docker', 'DevOps & Cloud'),
('AWS', 'aws', 'DevOps & Cloud'),
('Kubernetes', 'kubernetes', 'DevOps & Cloud'),
('Machine Learning', 'machine-learning', 'Data Science & AI'),
('Technical Writing', 'technical-writing', 'Content & Copywriting'),
('SEO', 'seo', 'Digital Marketing'),
('Automated Testing', 'automated-testing', 'Cybersecurity & QA');
