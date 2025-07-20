import { toast } from 'react-toastify';

class AutoLogoutService {
  private timeoutId: NodeJS.Timeout | null = null;
  private warningTimeoutId: NodeJS.Timeout | null = null;
  private lastActivityTime: number = Date.now();
  private readonly TIMEOUT_DURATION = 4 * 60 * 60 * 1000; // 4 hours
  private readonly WARNING_DURATION = 30 * 60 * 1000; // 30 minutes before logout
  private readonly ACTIVITY_EVENTS = [
    'mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'
  ];

  constructor() {
    this.init();
  }

  private init() {
    this.ACTIVITY_EVENTS.forEach(event => {
      document.addEventListener(event, this.resetTimer.bind(this), true);
    });
    this.resetTimer();
  }

  private resetTimer() {
    this.lastActivityTime = Date.now();
    
    if (this.timeoutId) clearTimeout(this.timeoutId);
    if (this.warningTimeoutId) clearTimeout(this.warningTimeoutId);

    if (this.isLoggedIn()) {
      this.warningTimeoutId = setTimeout(() => {
        this.showWarning();
      }, this.TIMEOUT_DURATION - this.WARNING_DURATION);

      this.timeoutId = setTimeout(() => {
        this.logout();
      }, this.TIMEOUT_DURATION);
    }
  }

  private isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  private showWarning() {
    if (!this.isLoggedIn()) return;

    toast.warning(
      'הפעילות שלך תפוג בעוד 30 דקות. לחץ כאן כדי להישאר מחובר.',
      {
        autoClose: false,
        closeOnClick: true,
        onClick: () => {
          this.resetTimer();
          toast.dismiss();
        },
        toastId: 'auto-logout-warning'
      }
    );
  }

  private logout() {
    if (!this.isLoggedIn()) return;

    localStorage.removeItem('token');
    
    toast.error('הפעילות שלך פגה. אנא התחבר מחדש.', {
      autoClose: 5000,
    });

    setTimeout(() => {
      window.location.href = '/';
    }, 2000);

    this.cleanup();
  }

  public forceLogout() {
    this.logout();
  }

  public extendSession() {
    if (this.isLoggedIn()) {
      this.resetTimer();
      toast.success('הפעילות הוארכה בהצלחה!');
    }
  }

  public cleanup() {
    this.ACTIVITY_EVENTS.forEach(event => {
      document.removeEventListener(event, this.resetTimer.bind(this), true);
    });

    if (this.timeoutId) clearTimeout(this.timeoutId);
    if (this.warningTimeoutId) clearTimeout(this.warningTimeoutId);
  }

  public getTimeRemaining(): number {
    if (!this.isLoggedIn()) return 0;
    
    const elapsed = Date.now() - this.lastActivityTime;
    const remaining = this.TIMEOUT_DURATION - elapsed;
    return Math.max(0, remaining);
  }

  public getTimeRemainingFormatted(): string {
    const remaining = this.getTimeRemaining();
    const hours = Math.floor(remaining / (1000 * 60 * 60));
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}:${minutes.toString().padStart(2, '0')}`;
  }
}

const autoLogoutService = new AutoLogoutService();
export default autoLogoutService;