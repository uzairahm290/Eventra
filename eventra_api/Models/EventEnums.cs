using System.ComponentModel.DataAnnotations;

namespace eventra_api.Models
{
    public enum EventCategory
    {
        Conference,
        Workshop,
        Seminar,
        Meetup,
        Concert,
        Exhibition,
        Wedding,
        Birthday,
        Corporate,
        Sports,
        Festival,
        Other
    }

    public enum EventStatus
    {
        Draft,
        Published,
        InProgress,
        Completed,
        Cancelled,
        Postponed
    }
}
