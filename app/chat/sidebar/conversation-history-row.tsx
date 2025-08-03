import { PencilSquareIcon, TrashIcon } from "@heroicons/react/24/outline";
import { Button } from "@heroui/button";

import { Conversation } from "@/types/chat.types";
import { formatRelativeTime } from "@/utils/dateFormatter";

const SingleConversationRow = ({
  item,
  columnKey,
  handleDeleteConversation,
  handleEditConversation,
  handleClick,
}: {
  item: Conversation;
  columnKey: keyof Conversation | "actions";
  handleDeleteConversation: (conversationId: string) => void;
  handleEditConversation: (value: boolean) => void;
  handleClick: () => void;
}) => {
  if (columnKey === "name") {
    return (
      <div
        className="flex flex-col cursor-pointer"
        onClick={handleClick}
        onTouchEnd={handleClick}
      >
        <span className="font-medium">{item.name || 'Untitled Conversation'}</span>
        <span className="text-xs text-gray-500">{formatRelativeTime(item.last_activity)}</span>
      </div>
    );
  }
  
  if (columnKey === "actions") {
    return (
      <div className="flex justify-end">
        <Button
          color="secondary"
          variant="light"
          size="sm"
          onPress={() => {
            handleEditConversation(true);
          }}
        >
          <PencilSquareIcon width={15} />
        </Button>
        <Button
          color="danger"
          variant="light"
          size="sm"
          onPress={async () => {
            handleDeleteConversation(item.id);
          }}
        >
          <TrashIcon width={15} />
        </Button>
      </div>
    );
  }

  return null;
};

export default SingleConversationRow;
