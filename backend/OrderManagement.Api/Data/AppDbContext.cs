using Microsoft.EntityFrameworkCore;
using OrderManagement.Api.Models;

namespace OrderManagement.Api.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<AdminUser> AdminUsers => Set<AdminUser>();
    public DbSet<Customer> Customers => Set<Customer>();
    public DbSet<Product> Products => Set<Product>();
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<OrderItem> OrderItems => Set<OrderItem>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<AdminUser>(entity =>
        {
            entity.Property(adminUser => adminUser.Username)
                .IsRequired()
                .HasMaxLength(AdminUser.MaxUsernameLength);

            entity.Property(adminUser => adminUser.PasswordHash)
                .IsRequired()
                .HasMaxLength(AdminUser.MaxPasswordHashLength);

            entity.HasIndex(adminUser => adminUser.Username)
                .IsUnique();
        });

        modelBuilder.Entity<Order>(entity =>
        {
            entity.Property(order => order.Status)
                .HasConversion<string>()
                .HasMaxLength(20);

            entity.Property(order => order.TotalAmount)
                .HasPrecision(18, 2);

            entity.HasOne(order => order.Customer)
                .WithMany()
                .HasForeignKey(order => order.CustomerId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasMany(order => order.OrderItems)
                .WithOne(orderItem => orderItem.Order)
                .HasForeignKey(orderItem => orderItem.OrderId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<OrderItem>(entity =>
        {
            entity.Property(orderItem => orderItem.UnitPrice)
                .HasPrecision(18, 2);

            entity.HasOne(orderItem => orderItem.Product)
                .WithMany()
                .HasForeignKey(orderItem => orderItem.ProductId)
                .OnDelete(DeleteBehavior.Restrict);
        });
    }
}
