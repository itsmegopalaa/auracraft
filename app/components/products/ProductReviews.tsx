const reviews = [
  {
    name: "Aarav",
    rating: 5,
    text: "Amazing quality notebook. The cover design looks premium and pages feel smooth.",
  },
  {
    name: "Riya",
    rating: 5,
    text: "Loved the design. Perfect for notes and creative writing.",
  },
  {
    name: "Kabir",
    rating: 4,
    text: "Good quality notebook with a beautiful premium feel.",
  },
];


export default function ProductReviews() {
  return (
    <section className="mt-20">

      <h2 className="
        text-4xl
        font-extrabold
        mb-8
      ">
        Customer <span className="text-yellow-400">Reviews</span> ⭐
      </h2>


      <div className="
        grid
        gap-6
        md:grid-cols-3
      ">

        {reviews.map((review, index) => (

          <div
            key={index}
            className="
              rounded-3xl
              border
              border-zinc-800
              bg-zinc-900
              p-6
            "
          >

            <div className="flex justify-between items-center">

              <h3 className="font-bold text-lg">
                {review.name}
              </h3>

              <span className="text-yellow-400">
                {"⭐".repeat(review.rating)}
              </span>

            </div>


            <p className="
              mt-5
              text-gray-400
              leading-7
            ">
              {review.text}
            </p>


            <p className="
              mt-5
              text-sm
              text-green-400
            ">
              ✓ Verified Buyer
            </p>


          </div>

        ))}

      </div>

    </section>
  );
}