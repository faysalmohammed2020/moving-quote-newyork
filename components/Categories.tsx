import React from "react";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { placeData } from "@/app/data/placeData";
import { postdata } from "@/app/data/postdata"; 
import Link from "next/link";

const Categories = () => {
  return (
    <div className="container mx-auto mt-12 mb-12 px-4">
      <h2 className="text-4xl font-bold text-center text-white mb-8">
        State Categories
      </h2>

      <Accordion
        type="single"
        collapsible
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6"
      >
        {placeData.map((item) => (
          <AccordionItem
            key={item.id}
            value={`item-${item.id}`}
            className="bg-gray-800 rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow"
          >
            <AccordionTrigger className=" text-yellow-500 font-bold">
              {item.name}
            </AccordionTrigger>
            <AccordionContent className="scrollbar text-white mt-2">
              <div className="mt-4">
                <strong>Blogs Title:</strong>
                {postdata
                  .filter((post) => post.category?.id === item.id) 
                  .map((post) => (
                    <div
                      key={post.ID}
                      className="mt-2 bg-gray-700 p-2 rounded-md shadow-sm"
                    >
                      <Link href={`/blogs/${post.ID}`} className="font-bold text-yellow-400">
                        {post.post_title}
                      </Link>
                    </div>
                  ))}
                {postdata.filter((post) => post.category?.id === item.id)
                  .length === 0 && (
                  <p className="text-gray-400">
                    No posts available for this category.
                  </p>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
};

export default Categories;
