using InvitationPlatform.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace InvitationPlatform.Infrastructure.Data.Configurations;

public class GuestSeatConfiguration : IEntityTypeConfiguration<GuestSeat>
{
    public void Configure(EntityTypeBuilder<GuestSeat> b)
    {
        b.ToTable("guest_seats");
        b.HasKey(e => e.Id);
        b.Property(e => e.Id).HasColumnName("id").HasDefaultValueSql("gen_random_uuid()");
        b.Property(e => e.GuestId).HasColumnName("guest_id");
        b.Property(e => e.SeatIndex).HasColumnName("seat_index");
        b.Property(e => e.Label).HasColumnName("label").HasMaxLength(256);
        b.Property(e => e.TableNumber).HasColumnName("table_number");
        b.Property(e => e.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("now()");
        b.Property(e => e.UpdatedAt).HasColumnName("updated_at").HasDefaultValueSql("now()");

        // UNIQUE, unlike guests.slug: this table is new, so there are no pre-existing rows to
        // collide with, and the constraint is what makes a seat upsert idempotent — two browser
        // tabs saving at once cannot create two seat 3s for the same guest.
        b.HasIndex(e => new { e.GuestId, e.SeatIndex }).IsUnique();

        // The plan is read by table ("who is at table 7"), so index the lookup column.
        b.HasIndex(e => e.TableNumber);

        b.HasOne(e => e.Guest)
         .WithMany(g => g.Seats)
         .HasForeignKey(e => e.GuestId)
         .OnDelete(DeleteBehavior.Cascade);
    }
}
