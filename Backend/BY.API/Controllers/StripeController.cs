using BY.Core.Enums;
using BY.Core.Interfaces;
using BY.Infrastructure.Configuration;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Stripe;

namespace BY.API.Controllers;

[ApiController]
[Route("api/v1/webhooks/[controller]")]
public class StripeController : ControllerBase
{
    private readonly ILogger<StripeController> _logger;
    private readonly StripeSettings _stripeSettings;
    private readonly IUnitOfWork _unitOfWork;

    public StripeController(
        ILogger<StripeController> logger,
        IOptions<StripeSettings> stripeSettings,
        IUnitOfWork unitOfWork)
    {
        _logger = logger;
        _stripeSettings = stripeSettings.Value;
        _unitOfWork = unitOfWork;
    }

    /// <summary>
    /// Handle Stripe webhook events
    /// </summary>
    [HttpPost]
    public async Task<IActionResult> HandleStripeWebhook()
    {
        var json = await new StreamReader(HttpContext.Request.Body).ReadToEndAsync();

        try
        {
            var stripeEvent = EventUtility.ConstructEvent(
                json,
                Request.Headers["Stripe-Signature"],
                _stripeSettings.WebhookSecret
            );

            _logger.LogInformation("Received Stripe webhook: {EventType} - {EventId}", 
                stripeEvent.Type, stripeEvent.Id);

            // Handle different event types
            switch (stripeEvent.Type)
            {
                case "payment_intent.succeeded":
                    await HandlePaymentIntentSucceeded(stripeEvent);
                    break;

                case "payment_intent.payment_failed":
                    await HandlePaymentIntentFailed(stripeEvent);
                    break;

                case "charge.dispute":
                    await HandleChargeDispute(stripeEvent);
                    break;

                case "invoice.payment_succeeded":
                    await HandleInvoicePaymentSucceeded(stripeEvent);
                    break;

                default:
                    _logger.LogInformation("Unhandled Stripe webhook event type: {EventType}", stripeEvent.Type);
                    break;
            }

            return Ok();
        }
        catch (StripeException ex)
        {
            _logger.LogError(ex, "Stripe webhook error: {Error}", ex.Message);
            return BadRequest();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing Stripe webhook");
            return StatusCode(500);
        }
    }

    private async Task HandlePaymentIntentSucceeded(Event stripeEvent)
    {
        if (stripeEvent.Data.Object is PaymentIntent paymentIntent)
        {
            _logger.LogInformation("Payment succeeded: {PaymentIntentId}", paymentIntent.Id);

            // Find our payment record
            var payment = await _unitOfWork.Payments.GetFirstOrDefaultAsync(p => 
                p.StripePaymentIntentId == paymentIntent.Id);

            if (payment != null)
            {
                payment.Status = PaymentStatus.Completed;
                payment.UpdatedAt = DateTime.UtcNow;
                
                await _unitOfWork.Payments.UpdateAsync(payment);
                await _unitOfWork.SaveChangesAsync();

                _logger.LogInformation("Updated payment status to completed for payment {PaymentId}", payment.Id);
            }
        }
    }

    private async Task HandlePaymentIntentFailed(Event stripeEvent)
    {
        if (stripeEvent.Data.Object is PaymentIntent paymentIntent)
        {
            _logger.LogWarning("Payment failed: {PaymentIntentId}", paymentIntent.Id);

            // Find our payment record
            var payment = await _unitOfWork.Payments.GetFirstOrDefaultAsync(p => 
                p.StripePaymentIntentId == paymentIntent.Id);

            if (payment != null)
            {
                payment.Status = PaymentStatus.Failed;
                payment.FailureReason = paymentIntent.LastPaymentError?.Message;
                payment.UpdatedAt = DateTime.UtcNow;
                
                await _unitOfWork.Payments.UpdateAsync(payment);
                await _unitOfWork.SaveChangesAsync();

                _logger.LogInformation("Updated payment status to failed for payment {PaymentId}", payment.Id);
            }
        }
    }

    private async Task HandleChargeDispute(Event stripeEvent)
    {
        if (stripeEvent.Data.Object is Dispute dispute)
        {
            _logger.LogWarning("Charge dispute received: {DisputeId} for charge {ChargeId}", 
                dispute.Id, dispute.ChargeId);

            // TODO: Handle dispute - notify admin, update payment status, etc.
            // This is important for accountability apps as users might dispute failure charges
            await Task.CompletedTask;
        }
    }

    private async Task HandleInvoicePaymentSucceeded(Event stripeEvent)
    {
        if (stripeEvent.Data.Object is Invoice invoice)
        {
            _logger.LogInformation("Invoice payment succeeded: {InvoiceId}", invoice.Id);
            
            // TODO: Handle subscription payments if you add premium features
            await Task.CompletedTask;
        }
    }
}