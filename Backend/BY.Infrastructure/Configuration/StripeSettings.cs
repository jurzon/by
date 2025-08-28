namespace BY.Infrastructure.Configuration;

public class StripeSettings
{
    public const string SectionName = "Stripe";
    
    public string PublishableKey { get; set; } = string.Empty;
    public string SecretKey { get; set; } = string.Empty;
    public string WebhookSecret { get; set; } = string.Empty;
    public string Currency { get; set; } = "usd";
    public bool CaptureCharges { get; set; } = true;
    public string ConnectAccountId { get; set; } = string.Empty;
    
    // Default charity information
    public string DefaultCharityName { get; set; } = "Local Food Bank";
    public string DefaultCharityId { get; set; } = "charity_default";
}