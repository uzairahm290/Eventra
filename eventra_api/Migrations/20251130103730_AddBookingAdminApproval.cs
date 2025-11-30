using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace eventra_api.Migrations
{
    /// <inheritdoc />
    public partial class AddBookingAdminApproval : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsApprovedByAdmin",
                table: "Bookings",
                type: "bit",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsApprovedByAdmin",
                table: "Bookings");
        }
    }
}
