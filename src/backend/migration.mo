import Stripe "stripe/stripe";
module {
  type OldActor = {
    configuration : ?Stripe.StripeConfiguration;
  };
  type NewActor = {
    stripeConfig : ?Stripe.StripeConfiguration;
  };

  public func run(old : OldActor) : NewActor {
    {
      stripeConfig = old.configuration;
    };
  };
};
