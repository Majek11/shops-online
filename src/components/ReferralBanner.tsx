const ReferralBanner = () => {
  return (
    <div className="rounded-2xl bg-gradient-to-r from-accent via-accent to-accent/60 flex flex-col md:flex-row relative overflow-hidden" style={{ minHeight: 180 }}>
      {/* Left section */}
      <div className="flex-1 p-6 md:p-8 flex flex-col justify-between relative z-10">
        <div>
          <p className="text-xs font-semibold text-accent-foreground/70 mb-2">Referral Bonus</p>
          <h2 className="text-xl font-bold text-foreground mb-2 leading-snug">
            Earn forever when you refer<br />friends to Join!
          </h2>
          <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
            Share your referral code and unlock instant rewards when your friends sign up and start using our services.
          </p>
        </div>
        <div className="mt-4">
          <button className="rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
            Join Program →
          </button>
        </div>
      </div>

      {/* Divider */}
      <div className="hidden md:block w-px bg-accent-foreground/10 my-6" />

      {/* Right section - Referral Reward Offer */}
      <div className="flex-1 p-6 md:p-8 flex flex-col justify-center relative z-10">
        <h3 className="text-lg font-bold text-foreground mb-4">Referral Reward Offer</h3>
        <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
          <li>Earn <span className="font-bold text-primary">0.5%</span> on your direct referral purchases,</li>
          <li><span className="font-bold text-primary">0.3%</span> when the purchases of customers they refer, and</li>
          <li><span className="font-bold text-primary">0.2%</span> of their referrals referral</li>
        </ol>
      </div>
    </div>
  );
};

export default ReferralBanner;
