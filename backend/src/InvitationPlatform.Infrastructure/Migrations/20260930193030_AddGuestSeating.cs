using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace InvitationPlatform.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddGuestSeating : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "seating_enabled",
                table: "invitations",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "seating_token",
                table: "invitations",
                type: "character varying(128)",
                maxLength: 128,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "table_count",
                table: "invitations",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateTable(
                name: "guest_seats",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    guest_id = table.Column<Guid>(type: "uuid", nullable: false),
                    seat_index = table.Column<int>(type: "integer", nullable: false),
                    label = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    table_number = table.Column<int>(type: "integer", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()"),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_guest_seats", x => x.id);
                    table.ForeignKey(
                        name: "FK_guest_seats_guests_guest_id",
                        column: x => x.guest_id,
                        principalTable: "guests",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_invitations_seating_token",
                table: "invitations",
                column: "seating_token",
                unique: true,
                filter: "seating_token <> ''");

            migrationBuilder.CreateIndex(
                name: "IX_guest_seats_guest_id_seat_index",
                table: "guest_seats",
                columns: new[] { "guest_id", "seat_index" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_guest_seats_table_number",
                table: "guest_seats",
                column: "table_number");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "guest_seats");

            migrationBuilder.DropIndex(
                name: "IX_invitations_seating_token",
                table: "invitations");

            migrationBuilder.DropColumn(
                name: "seating_enabled",
                table: "invitations");

            migrationBuilder.DropColumn(
                name: "seating_token",
                table: "invitations");

            migrationBuilder.DropColumn(
                name: "table_count",
                table: "invitations");
        }
    }
}
