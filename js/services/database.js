// ============================================================
// QAF – Firebase Database Service Layer
// ============================================================

const DbService = {
  // ── Teams ──
  teams: {
    async create(data) {
      const id = QAF.generateId('TEAM');
      data.teamId = id;
      data.createdAt = Date.now();
      data.approved = false;
      data.points = 0;
      await db.ref('teams/' + id).set(data);
      return id;
    },
    async getAll() {
      const snap = await db.ref('teams').once('value');
      return snap.val() || {};
    },
    async get(id) {
      const snap = await db.ref('teams/' + id).once('value');
      return snap.val();
    },
    async update(id, data) {
      data.updatedAt = Date.now();
      await db.ref('teams/' + id).update(data);
    },
    async remove(id) {
      await db.ref('teams/' + id).remove();
    },
    onUpdate(cb) {
      db.ref('teams').on('value', snap => cb(snap.val() || {}));
    }
  },

  // ── Students ──
  students: {
    async create(teamId, data) {
      const id = db.ref('students').push().key;
      data.id = id;
      data.teamId = teamId;
      data.createdAt = Date.now();
      await db.ref('students/' + id).set(data);
      return id;
    },
    async getByTeam(teamId) {
      const snap = await db.ref('students').orderByChild('teamId').equalTo(teamId).once('value');
      return snap.val() || {};
    },
    async getAll() {
      const snap = await db.ref('students').once('value');
      return snap.val() || {};
    },
    async get(id) {
      const snap = await db.ref('students/' + id).once('value');
      return snap.val();
    },
    async update(id, data) {
      await db.ref('students/' + id).update(data);
    },
    async remove(id) {
      await db.ref('students/' + id).remove();
    }
  },

  // ── Programs ──
  programs: {
    async create(data) {
      const id = db.ref('programs').push().key;
      data.id = id;
      data.createdAt = Date.now();
      await db.ref('programs/' + id).set(data);
      return id;
    },
    async getAll() {
      const snap = await db.ref('programs').once('value');
      return snap.val() || {};
    },
    async get(id) {
      const snap = await db.ref('programs/' + id).once('value');
      return snap.val();
    },
    async update(id, data) {
      await db.ref('programs/' + id).update(data);
    },
    async remove(id) {
      await db.ref('programs/' + id).remove();
    },
    onUpdate(cb) {
      db.ref('programs').on('value', snap => cb(snap.val() || {}));
    }
  },

  // ── Categories ──
  categories: {
    async create(data) {
      const id = db.ref('categories').push().key;
      data.id = id;
      await db.ref('categories/' + id).set(data);
      return id;
    },
    async getAll() {
      const snap = await db.ref('categories').once('value');
      return snap.val() || {};
    },
    async update(id, data) {
      await db.ref('categories/' + id).update(data);
    },
    async remove(id) {
      await db.ref('categories/' + id).remove();
    }
  },

  // ── Topic Submissions ──
  topics: {
    async create(data) {
      const id = db.ref('topicSubmissions').push().key;
      data.id = id;
      data.status = 'pending';
      data.createdAt = Date.now();
      await db.ref('topicSubmissions/' + id).set(data);
      return id;
    },
    async getByTeam(teamId) {
      const snap = await db.ref('topicSubmissions').orderByChild('teamId').equalTo(teamId).once('value');
      return snap.val() || {};
    },
    async getAll() {
      const snap = await db.ref('topicSubmissions').once('value');
      return snap.val() || {};
    },
    async update(id, data) {
      await db.ref('topicSubmissions/' + id).update(data);
    },
    async remove(id) {
      await db.ref('topicSubmissions/' + id).remove();
    }
  },

  // ── Results ──
  results: {
    async addMark(data) {
      const id = db.ref('results').push().key;
      data.id = id;
      data.createdAt = Date.now();
      await db.ref('results/' + id).set(data);
      return id;
    },
    async getByProgram(programId) {
      const snap = await db.ref('results').orderByChild('programId').equalTo(programId).once('value');
      return snap.val() || {};
    },
    async getAll() {
      const snap = await db.ref('results').once('value');
      return snap.val() || {};
    },
    async update(id, data) {
      await db.ref('results/' + id).update(data);
    },
    async remove(id) {
      await db.ref('results/' + id).remove();
    },
    onUpdate(cb) {
      db.ref('results').on('value', snap => cb(snap.val() || {}));
    }
  },

  // ── Leaderboard ──
  leaderboard: {
    async update(teamId, points) {
      await db.ref('leaderboard/' + teamId).set({ teamId, points, updatedAt: Date.now() });
    },
    async getAll() {
      const snap = await db.ref('leaderboard').orderByChild('points').once('value');
      const data = [];
      snap.forEach(child => data.unshift(child.val()));
      return data;
    },
    onUpdate(cb) {
      db.ref('leaderboard').orderByChild('points').on('value', snap => {
        const data = [];
        snap.forEach(child => data.unshift(child.val()));
        cb(data);
      });
    }
  },

  // ── Announcements ──
  announcements: {
    async create(data) {
      const id = db.ref('announcements').push().key;
      data.id = id;
      data.createdAt = Date.now();
      await db.ref('announcements/' + id).set(data);
      return id;
    },
    async getAll() {
      const snap = await db.ref('announcements').orderByChild('createdAt').once('value');
      const data = [];
      snap.forEach(child => data.unshift(child.val()));
      return data;
    },
    async remove(id) {
      await db.ref('announcements/' + id).remove();
    },
    onUpdate(cb) {
      db.ref('announcements').orderByChild('createdAt').on('value', snap => {
        const data = [];
        snap.forEach(child => data.unshift(child.val()));
        cb(data);
      });
    }
  },

  // ── Settings ──
  settings: {
    async get() {
      const snap = await db.ref('settings').once('value');
      return snap.val() || {
        registrationOpen: true,
        topicSubmissionOpen: true,
        resultsPublished: false,
        eventDate: '',
        eventName: 'Quranic Art Fest 2026'
      };
    },
    async update(data) {
      await db.ref('settings').update(data);
    },
    onUpdate(cb) {
      db.ref('settings').on('value', snap => cb(snap.val() || {}));
    }
  },

  // ── Notifications ──
  notifications: {
    async send(teamId, data) {
      const id = db.ref('notifications/' + teamId).push().key;
      data.id = id;
      data.read = false;
      data.createdAt = Date.now();
      await db.ref('notifications/' + teamId + '/' + id).set(data);
    },
    async getByTeam(teamId) {
      const snap = await db.ref('notifications/' + teamId).orderByChild('createdAt').once('value');
      const data = [];
      snap.forEach(child => data.unshift(child.val()));
      return data;
    },
    async markRead(teamId, notifId) {
      await db.ref('notifications/' + teamId + '/' + notifId).update({ read: true });
    }
  },

  // ── Audit Logs ──
  logs: {
    async add(action, details, userId) {
      const id = db.ref('auditLogs').push().key;
      await db.ref('auditLogs/' + id).set({
        id, action, details, userId,
        timestamp: Date.now()
      });
    },
    async getAll(limit = 50) {
      const snap = await db.ref('auditLogs').orderByChild('timestamp').limitToLast(limit).once('value');
      const data = [];
      snap.forEach(child => data.unshift(child.val()));
      return data;
    }
  }
};

window.DbService = DbService;
