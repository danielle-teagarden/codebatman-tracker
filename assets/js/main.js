// Code Batman Dashboard JavaScript

class CodeBatmanDashboard {
  constructor() {
    this.data = null;
    this.init();
  }

  async init() {
    await this.loadData();
    this.renderContributions();
    this.renderStats();
    this.updateHeroStats();
  }

  async loadData() {
    try {
      const response = await fetch('./data/contributions.json');
      this.data = await response.json();
    } catch (error) {
      console.error('Error loading contributions data:', error);
      this.data = { contributions: [] };
    }
  }

  updateHeroStats() {
    if (!this.data) return;

    const totalContributions = this.data.metadata?.totalContributions || this.data.contributions.length;
    const totalOrganizations = this.data.metadata?.totalOrganizations || new Set(this.data.contributions.map(c => c.organization)).size;
    const latestContribution = this.data.contributions[0];
    const latestImpact = latestContribution?.impact || 'Unknown';

    document.getElementById('total-contributions').textContent = totalContributions;
    document.getElementById('total-organizations').textContent = totalOrganizations;
    document.getElementById('total-impact').textContent = latestImpact.charAt(0).toUpperCase() + latestImpact.slice(1);
  }

  renderContributions() {
    if (!this.data || !this.data.contributions) return;

    const container = document.getElementById('contributions-grid');
    container.innerHTML = '';

    this.data.contributions.forEach(contribution => {
      const card = this.createContributionCard(contribution);
      container.appendChild(card);
    });
  }

  createContributionCard(contribution) {
    const card = document.createElement('div');
    card.className = 'contribution-card';

    const statusClass = `status-${contribution.status}`;
    const impactIcon = this.getImpactIcon(contribution.impact);
    const categoryIcon = this.getCategoryIcon(contribution.category);

    card.innerHTML = `
      <div class="contribution-header">
        <div>
          <h3 class="contribution-title">${contribution.title}</h3>
          <div class="contribution-org">${contribution.organization} • ${contribution.project}</div>
        </div>
        <span class="contribution-status ${statusClass}">${contribution.status}</span>
      </div>
      
      <p class="contribution-description">${contribution.description}</p>
      
      <div class="contribution-meta">
        <div class="meta-item">
          <i class="fas fa-calendar"></i>
          <span>${this.formatDate(contribution.dateSubmitted)}</span>
        </div>
        <div class="meta-item">
          <i class="fas ${impactIcon}"></i>
          <span>${contribution.impact} impact</span>
        </div>
        <div class="meta-item">
          <i class="fas ${categoryIcon}"></i>
          <span>${contribution.category.replace('-', ' ')}</span>
        </div>
        <div class="meta-item">
          <i class="fas fa-clock"></i>
          <span>${contribution.timeInvested}</span>
        </div>
      </div>

      <div class="tech-tags">
        ${contribution.technicalSkillsUsed.slice(0, 4).map(skill => 
          `<span class="tech-tag">${skill}</span>`
        ).join('')}
        ${contribution.technicalSkillsUsed.length > 4 ? 
          `<span class="tech-tag">+${contribution.technicalSkillsUsed.length - 4} more</span>` : 
          ''
        }
      </div>

      <div class="contribution-links">
        ${contribution.pullRequestUrl ? 
          `<a href="${contribution.pullRequestUrl}" target="_blank" class="btn btn-primary">
            <i class="fab fa-github"></i>
            View PR #${contribution.pullRequestNumber}
          </a>` : 
          ''
        }
        ${contribution.issueUrl ? 
          `<a href="${contribution.issueUrl}" target="_blank" class="btn btn-secondary">
            <i class="fas fa-bug"></i>
            Issue #${contribution.issueNumber}
          </a>` : 
          ''
        }
      </div>
    `;

    return card;
  }

  renderStats() {
    this.renderSkillsChart();
    this.renderImpactChart();
    this.renderToolsChart();
  }

  renderSkillsChart() {
    if (!this.data || !this.data.contributions) return;

    const skillsContainer = document.getElementById('skills-chart');
    const allSkills = this.data.contributions.flatMap(c => c.technicalSkillsUsed);
    const skillCounts = this.countItems(allSkills);
    const topSkills = Object.entries(skillCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 8);

    skillsContainer.innerHTML = topSkills.map(([skill, count]) => `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.8rem;">
        <span style="color: var(--text-secondary); font-size: 0.9rem;">${skill}</span>
        <span style="color: var(--secondary-color); font-weight: 600;">${count}</span>
      </div>
    `).join('');
  }

  renderImpactChart() {
    if (!this.data || !this.data.contributions) return;

    const impactContainer = document.getElementById('impact-chart');
    const impacts = this.data.contributions.map(c => c.impact);
    const impactCounts = this.countItems(impacts);

    const impactColors = {
      'high': 'var(--success-color)',
      'medium': 'var(--warning-color)',
      'low': 'var(--info-color)'
    };

    impactContainer.innerHTML = Object.entries(impactCounts).map(([impact, count]) => `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.8rem;">
        <div style="display: flex; align-items: center; gap: 0.5rem;">
          <div style="width: 12px; height: 12px; border-radius: 50%; background: ${impactColors[impact] || 'var(--text-secondary)'}"></div>
          <span style="color: var(--text-secondary); font-size: 0.9rem; text-transform: capitalize;">${impact}</span>
        </div>
        <span style="color: var(--secondary-color); font-weight: 600;">${count}</span>
      </div>
    `).join('');
  }

  renderToolsChart() {
    if (!this.data || !this.data.contributions) return;

    const toolsContainer = document.getElementById('tools-chart');
    const allTools = this.data.contributions.flatMap(c => c.toolsLeveraged);
    const toolCounts = this.countItems(allTools);
    const topTools = Object.entries(toolCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 6);

    toolsContainer.innerHTML = topTools.map(([tool, count]) => `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.8rem;">
        <span style="color: var(--text-secondary); font-size: 0.9rem;">${tool}</span>
        <span style="color: var(--secondary-color); font-weight: 600;">${count}</span>
      </div>
    `).join('');
  }

  countItems(items) {
    return items.reduce((acc, item) => {
      acc[item] = (acc[item] || 0) + 1;
      return acc;
    }, {});
  }

  formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  }

  getImpactIcon(impact) {
    const icons = {
      'high': 'fa-star',
      'medium': 'fa-star-half-alt', 
      'low': 'fa-star-half'
    };
    return icons[impact] || 'fa-star';
  }

  getCategoryIcon(category) {
    const icons = {
      'developer-tooling': 'fa-tools',
      'bug-fix': 'fa-bug',
      'feature': 'fa-plus',
      'documentation': 'fa-book',
      'performance': 'fa-tachometer-alt',
      'security': 'fa-shield-alt'
    };
    return icons[category] || 'fa-code';
  }
}

// Smooth scrolling for navigation links
document.addEventListener('DOMContentLoaded', () => {
  // Initialize dashboard
  new CodeBatmanDashboard();

  // Smooth scrolling
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });

  // Add scroll effect to header
  window.addEventListener('scroll', () => {
    const header = document.querySelector('.header');
    if (window.scrollY > 100) {
      header.style.background = 'rgba(0, 0, 0, 0.98)';
    } else {
      header.style.background = 'rgba(0, 0, 0, 0.95)';
    }
  });
});
