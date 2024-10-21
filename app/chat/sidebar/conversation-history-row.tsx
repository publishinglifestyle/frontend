import { Conversation } from "@/types/chat.types";
import { PencilSquareIcon, TrashIcon } from "@heroicons/react/24/outline";
import { Button } from "@nextui-org/button";

const SingleConversationRow = ({
  item,
  columnKey,
  handleDeleteConversation,
  handleEditConversation,
}: {
  item: Conversation;
  columnKey: keyof Conversation;
  handleDeleteConversation: (conversationId: string) => void;
  handleEditConversation: (value: boolean) => void;
}) => {
  if (columnKey === "id") {
    return (
      <div className="flex justify-between items-center">
        <div className="flex-1 text-start">
          <span>{item.name}</span>
        </div>
        <div className="flex">
          <Button
            variant="light"
            color="danger"
            onClick={async (e) => {
              e.preventDefault();
              handleDeleteConversation(item.id);
            }}
          >
            <TrashIcon width={15} />
          </Button>
          <Button
            variant="light"
            color="secondary"
            className="-ml-8"
            onClick={() => {
              handleEditConversation(true);
            }}
          >
            <PencilSquareIcon width={15} />
          </Button>
        </div>
      </div>
    );
  }
  return null;
};

export default SingleConversationRow;
