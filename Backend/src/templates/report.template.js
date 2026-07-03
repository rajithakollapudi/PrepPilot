module.exports = (data) => `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333; line-height: 1.6; padding: 40px; }
        .header { text-align: center; border-bottom: 2px solid #ff6b00; padding-bottom: 20px; margin-bottom: 30px; }
        .header h1 { margin: 0; color: #000; font-size: 28px; }
        .header p { margin: 5px 0 0; color: #666; }
        
        .score-section { display: flex; align-items: center; justify-content: center; margin-bottom: 40px; background: #fffcf9; border: 1px solid #ffe8d6; padding: 20px; border-radius: 12px; }
        .score-box { text-align: center; }
        .score-box h2 { margin: 0; font-size: 48px; color: #ff6b00; }
        .score-box p { margin: 0; font-weight: bold; text-transform: uppercase; font-size: 14px; color: #999; }

        .section { margin-bottom: 30px; }
        .section-title { font-size: 18px; font-weight: bold; color: #000; border-left: 4px solid #ff6b00; padding-left: 12px; margin-bottom: 15px; text-transform: uppercase; letter-spacing: 1px; }
        
        .gap-item { display: flex; justify-content: space-between; padding: 10px; border-bottom: 1px solid #eee; }
        .gap-skill { font-weight: 600; }
        .gap-severity { font-size: 12px; padding: 2px 8px; border-radius: 4px; text-transform: uppercase; }
        .severity-high { background: #fee2e2; color: #ef4444; }
        .severity-medium { background: #fef9c3; color: #ca8a04; }
        .severity-low { background: #dcfce7; color: #16a34a; }

        .timeline { list-style: none; padding: 0; }
        .timeline-day { margin-bottom: 15px; }
        .timeline-day h4 { margin: 0 0 5px; color: #ff6b00; }
        .timeline-day ul { padding-left: 20px; margin: 0; }

        .question-card { margin-bottom: 25px; padding: 15px; background: #f9f9f9; border-radius: 8px; border-left: 3px solid #ddd; }
        .question-text { font-weight: 600; font-size: 16px; margin-bottom: 10px; }
        .detail-block { margin-top: 10px; font-size: 14px; }
        .detail-label { font-weight: bold; color: #666; display: block; margin-bottom: 4px; }
        
        .job-card { margin-bottom: 15px; padding: 15px; border: 1px solid #eee; border-radius: 8px; }
        .job-title { font-weight: bold; color: #ff6b00; font-size: 16px; }
        .job-company { color: #666; font-size: 14px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Interview Intelligence Report</h1>
        <p>${data.title || 'Target Role'}</p>
    </div>

    <div class="score-section">
        <div class="score-box">
            <h2>${data.matchScore || 0}%</h2>
            <p>Overall Role Fit</p>
        </div>
    </div>

    <div class="section">
        <div class="section-title">Skill Gaps & Impact</div>
        ${(data.skillGaps || []).map(gap => `
            <div class="gap-item">
                <span class="gap-skill">${gap.skill}</span>
                <span class="gap-severity severity-${(gap.severity || 'low').toLowerCase()}">${gap.severity}</span>
            </div>
        `).join('')}
    </div>

    <div class="section">
        <div class="section-title">Preparation Roadmap</div>
        <div class="timeline">
            ${(data.preparationPlan || []).map(day => `
                <div class="timeline-day">
                    <h4>Day ${day.day}: ${day.focus}</h4>
                    <ul>
                        ${day.tasks.map(task => `<li>${task}</li>`).join('')}
                    </ul>
                </div>
            `).join('')}
        </div>
    </div>

    <div class="section">
        <div class="section-title">Anticipated Questions</div>
        ${(data.technicalQuestions || []).concat(data.behavioralQuestions || []).map((q, i) => `
            <div class="question-card">
                <div class="question-text">${i + 1}. ${q.question}</div>
                <div class="detail-block">
                    <span class="detail-label">Intention:</span>
                    <div>${q.intention || q.insights}</div>
                </div>
                <div class="detail-block">
                    <span class="detail-label">Suggested Approach:</span>
                    <div>${q.answer || q.strategy}</div>
                </div>
            </div>
        `).join('')}
    </div>

    <div class="section">
        <div class="section-title">Matching Opportunities</div>
        ${(data.jobs || []).map(job => `
            <div class="job-card">
                <div class="job-title">${job.title}</div>
                <div class="job-company">${job.company} | ${job.location}</div>
                <div style="font-size: 12px; color: #999; margin-top: 5px;">Match Score: ${job.matchScore || 0}%</div>
            </div>
        `).join('')}
    </div>
</body>
</html>
`
