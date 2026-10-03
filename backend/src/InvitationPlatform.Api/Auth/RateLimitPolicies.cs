namespace InvitationPlatform.Api.Auth;

/// <summary>
/// Names of the rate-limiting policies registered in <c>Program.cs</c>. Constants rather than
/// string literals so an <c>[EnableRateLimiting]</c> attribute cannot drift from the
/// registration — a typo there is accepted silently at startup and shows up only as an endpoint
/// that was never actually limited.
/// </summary>
public static class RateLimitPolicies
{
    /// <summary>
    /// The anonymous "find my table" lookup. Limited because the seating token is a capability
    /// that ends up printed on a card at the venue: once it leaks, the only thing between a
    /// stranger and the whole guest list is how fast they can query.
    ///
    /// Sized for the real usage pattern, which is bursty — a hundred guests arriving at once,
    /// each searching once or twice from their own phone — so the budget is per IP and
    /// comfortably above what one guest needs, while far below a useful scrape rate.
    /// </summary>
    public const string SeatingLookup = "seating-lookup";
}
