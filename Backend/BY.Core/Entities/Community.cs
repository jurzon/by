namespace BY.Core.Entities;

public class Community : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string? ImageUrl { get; set; }
    public bool IsPublic { get; set; } = true;
    public Guid CreatedByUserId { get; set; }
    
    // Navigation properties
    public virtual User CreatedByUser { get; set; } = null!;
    public virtual ICollection<CommunityMember> Members { get; set; } = new List<CommunityMember>();
    public virtual ICollection<CommunityPost> Posts { get; set; } = new List<CommunityPost>();
}

public class CommunityMember : BaseEntity
{
    public Guid CommunityId { get; set; }
    public Guid UserId { get; set; }
    public string Role { get; set; } = "Member"; // Member, Moderator, Admin
    public DateTime JoinedAt { get; set; } = DateTime.UtcNow;
    
    // Navigation properties
    public virtual Community Community { get; set; } = null!;
    public virtual User User { get; set; } = null!;
}

public class CommunityPost : BaseEntity
{
    public Guid CommunityId { get; set; }
    public Guid UserId { get; set; }
    public Guid? GoalId { get; set; }
    public string Content { get; set; } = string.Empty;
    public string? ImageUrl { get; set; }
    public int LikesCount { get; set; } = 0;
    public int CommentsCount { get; set; } = 0;
    
    // Navigation properties
    public virtual Community Community { get; set; } = null!;
    public virtual User User { get; set; } = null!;
    public virtual Goal? Goal { get; set; }
}