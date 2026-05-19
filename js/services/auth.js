// ============================================================
// QAF – Authentication Service
// ============================================================

const AuthService = {
  currentUser: null,
  currentTeam: null,
  isAdmin: false,

  // Team Registration + Firebase Auth
  async registerTeam(email, password, teamData) {
    try {
      const cred = await auth.createUserWithEmailAndPassword(email, password);
      const uid = cred.user.uid;
      teamData.uid = uid;
      teamData.email = email;
      const teamId = await DbService.teams.create(teamData);
      await db.ref('users/' + uid).set({ teamId, role: 'team', email });
      await DbService.logs.add('team_registered', `Team ${teamData.collegeName} registered`, uid);
      return { uid, teamId };
    } catch (error) {
      throw error;
    }
  },

  // Team Login
  async loginTeam(email, password) {
    try {
      const cred = await auth.signInWithEmailAndPassword(email, password);
      const uid = cred.user.uid;
      const userSnap = await db.ref('users/' + uid).once('value');
      const userData = userSnap.val();
      if (!userData || userData.role !== 'team') throw new Error('Invalid team account');
      this.currentTeam = await DbService.teams.get(userData.teamId);
      this.currentUser = { uid, ...userData };
      this.isAdmin = false;
      return this.currentTeam;
    } catch (error) {
      throw error;
    }
  },

  // Admin Login
  async loginAdmin(email, password) {
    try {
      const cred = await auth.signInWithEmailAndPassword(email, password);
      const uid = cred.user.uid;
      const userSnap = await db.ref('users/' + uid).once('value');
      const userData = userSnap.val();
      if (!userData || userData.role !== 'admin') {
        await auth.signOut();
        throw new Error('Not authorized as admin');
      }
      this.currentUser = { uid, ...userData };
      this.isAdmin = true;
      await DbService.logs.add('admin_login', 'Admin logged in', uid);
      return userData;
    } catch (error) {
      throw error;
    }
  },

  // Logout
  async logout() {
    await auth.signOut();
    this.currentUser = null;
    this.currentTeam = null;
    this.isAdmin = false;
  },

  // Check auth state
  onAuthChanged(callback) {
    auth.onAuthStateChanged(async (user) => {
      if (user) {
        const userSnap = await db.ref('users/' + user.uid).once('value');
        const userData = userSnap.val();
        if (userData) {
          this.currentUser = { uid: user.uid, ...userData };
          this.isAdmin = userData.role === 'admin';
          if (userData.teamId) {
            this.currentTeam = await DbService.teams.get(userData.teamId);
          }
        }
      } else {
        this.currentUser = null;
        this.currentTeam = null;
        this.isAdmin = false;
      }
      callback(user);
    });
  },

  // Auth Guard
  requireAuth(redirectUrl = '/pages/team-login.html') {
    if (!auth.currentUser) {
      window.location.href = redirectUrl;
      return false;
    }
    return true;
  },

  requireAdmin(redirectUrl = '/pages/admin-login.html') {
    if (!this.isAdmin) {
      window.location.href = redirectUrl;
      return false;
    }
    return true;
  }
};

window.AuthService = AuthService;
