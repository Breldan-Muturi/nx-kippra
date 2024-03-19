import React from "react";
import AddTopic from "./components/add-topic";
import { Button, buttonVariants } from "@/components/ui/button";
import { getTopicsByProgramId } from "@/helpers/topics.helpers";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { currentRole } from "@/lib/auth";
import { UserRole } from "@prisma/client";
import UpdateTopic from "./components/update-topic";
import { Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import DeleteTopic from "./components/delete-topic";

const TopicPage = async ({
  params: { programId },
  searchParams: { deleteTopicId, updateTopicId, newTopic },
}: {
  params: { programId: string };
  searchParams: {
    deleteTopicId: string;
    updateTopicId: string;
    newTopic: boolean;
  };
}) => {
  const topicPromise = getTopicsByProgramId(programId);
  const rolePromise = currentRole();

  const [topics, role] = await Promise.all([topicPromise, rolePromise]);

  const isAdmin = role === UserRole.ADMIN;
  const deleteThisTopic = topics?.find(({ id }) => id === deleteTopicId);
  const updateThisTopic = topics?.find(({ id }) => id === updateTopicId);
  return (
    <>
      <div className="flex w-4/5 flex-col space-y-4">
        {isAdmin && (
          <Link
            href={{
              pathname: `/${programId}/topics/`,
              query: { newTopic: true },
            }}
            className={cn(
              buttonVariants({ variant: "ghost" }),
              "text-center text-xl font-bold",
            )}
          >
            📋 Add a new Topic
          </Link>
        )}
        {topics && (
          <Accordion type="single" collapsible className="w-full">
            {topics.map((topic) => {
              const { id, title, summary } = topic;
              return (
                <AccordionItem key={`${id}-${title}`} value={id}>
                  <AccordionTrigger className="text-lg text-green-600">
                    {title}
                  </AccordionTrigger>
                  <AccordionContent className="flex items-center justify-between pr-2 pt-2">
                    {summary}
                    {isAdmin && (
                      <div className="flex space-x-2">
                        <Link
                          href={{
                            pathname: `/${programId}/topics/`,
                            query: { updateTopicId: id },
                          }}
                          className={cn(
                            buttonVariants({
                              variant: "ghost",
                              size: "icon",
                            }),
                            "h-6 w-6 rounded-full bg-green-600/80 hover:bg-green-600",
                          )}
                        >
                          <Pencil className="h-4 w-4" color="white" />
                        </Link>
                        <Link
                          href={{
                            pathname: `/${programId}/topics/`,
                            query: { deleteTopicId: id },
                          }}
                          className={cn(
                            buttonVariants({
                              variant: "destructive",
                              size: "icon",
                            }),
                            "h-6 w-6 rounded-full",
                          )}
                        >
                          <Trash2 className="h-4 w-4" color="white" />
                        </Link>
                      </div>
                    )}
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        )}
      </div>
      {isAdmin && deleteThisTopic && <DeleteTopic topic={deleteThisTopic} />}
      {isAdmin && updateThisTopic && <UpdateTopic topic={updateThisTopic} />}
      {isAdmin && newTopic && <AddTopic programId={programId} />}
    </>
  );
};

export default TopicPage;
