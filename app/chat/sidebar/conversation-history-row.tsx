import { PencilSquareIcon, TrashIcon } from "@heroicons/react/24/outline";
import { Button } from "@heroui/button";

import { Conversation } from "@/types/chat.types";

const SingleConversationRow = ({
  item,
  columnKey,
  handleDeleteConversation,
  handleEditConversation,
  handleClick,
}: {
  item: Conversation;
  columnKey: keyof Conversation;
  handleDeleteConversation: (conversationId: string) => void;
  handleEditConversation: (value: boolean) => void;
  handleClick: () => void;
}) => {
  if (columnKey === "id") {
    return (
      <div
        className="flex justify-between items-center"
        onClick={handleClick}
        onTouchEnd={handleClick}
      >
        <div className="flex-1 text-start">
          <span>{item.name}</span>
        </div>
        <div className="flex">
          <Button
            color="danger"
            variant="light"
            onPress={async () => {
              handleDeleteConversation(item.id);
            }}
          >
            <TrashIcon width={15} />
          </Button>
          <Button
            className="-ml-8"
            color="secondary"
            variant="light"
            onPress={() => {
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
