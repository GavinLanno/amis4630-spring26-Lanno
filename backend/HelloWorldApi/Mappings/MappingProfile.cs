using AutoMapper;
using HelloWorldApi.DTOs;
using HelloWorldApi.Models;

namespace HelloWorldApi.Mappings;

public class MappingProfile : Profile
{
    public MappingProfile()
    {
        CreateMap<Cart, CartDto>()
            .ForMember(dest => dest.CartItems, opt => opt.MapFrom(src => src.CartItems));

        CreateMap<CartItem, CartItemDto>()
            .ForMember(dest => dest.Address, opt => opt.MapFrom(src => src.Listing.Address))
            .ForMember(dest => dest.ImageURL, opt => opt.MapFrom(src => src.Listing.ImageURL))
            .ForMember(dest => dest.Price, opt => opt.MapFrom(src => src.Listing.Price))
            .ForMember(dest => dest.CategoryName, opt => opt.MapFrom(src => src.Listing.Category.Name));
    }
}
