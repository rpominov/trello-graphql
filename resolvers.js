function encode(strings, ...vars) {
  return strings.map((s, i) => s + encodeURIComponent(vars[i] || "")).join("");
}

function getFields(ast) {
  // Not sure about this code...
  const collections = ast.fieldNodes.map(fieldNode =>
    fieldNode.selectionSet.selections.map(selection => selection.name.value)
  );
  const withDuplicates = collections.reduce((acc, cur) => {
    return acc.concat(cur);
  }, []);
  return [...new Set(withDuplicates)];
}

const TRELLO_BOARD_FIELDS = [
  "id",
  "name",
  "desc",
  "descData",
  "closed",
  "idOrganization",
  "pinned",
  "url",
  "shortUrl",
  "prefs",
  "labelNames",
  "starred",
  "limits",
  "memberships"
];

const TRELLO_MEMBER_FIELDS = [
  "id",
  "avatarHash",
  "avatarUrl",
  "avatarSource",
  "bio",
  "bioData",
  "confirmed",
  "email",
  "fullName",
  "gravatarHash",
  "idBoards",
  "idBoardsPinned",
  "idOrganizations",
  "idEnterprisesAdmin",
  "idPremOrgsAdmin",
  "initials",
  "loginTypes",
  "memberType",
  "oneTimeMessagesDismissed",
  "prefs",
  "premiumFeatures",
  "products",
  "status",
  "trophies",
  "uploadedAvatarHash",
  "uploadedAvatarUrl",
  "url",
  "username"
];

const TRELLO_LIST_FIELDS = [
  "id",
  "name",
  "closed",
  "idBoard",
  "pos",
  "subscribed"
];

const TRELLO_CARD_FIELDS = [
  "id",
  "badges",
  "checkItemStates",
  "closed",
  "dateLastActivity",
  "desc",
  "descData",
  "due",
  "dueComplete",
  "idAttachmentCover",
  "idBoard",
  "idChecklists",
  "idLabels",
  "idList",
  "idMembers",
  "idMembersVoted",
  "idShort",
  "labels",
  "manualCoverAttachment",
  "name",
  "pos",
  "shortLink",
  "shortUrl",
  "subscribed",
  "url"
];

module.exports = {
  Query: {
    member: (_parent, args, context, ast) => {
      const fields = getFields(ast)
        .filter(field => TRELLO_MEMBER_FIELDS.includes(field))
        .join(",");

      return context.request(encode`members/${args.id}`, {
        params: { fields }
      });
    },
    board: (_parent, args, context, ast) => {
      const fields = getFields(ast)
        .filter(field => TRELLO_BOARD_FIELDS.includes(field))
        .join(",");

      return context.request(encode`boards/${args.id}`, {
        params: { fields }
      });
    },
    list: (_parent, args, context, ast) => {
      const fields = getFields(ast)
        .filter(field => TRELLO_LIST_FIELDS.includes(field))
        .join(",");

      return context.request(encode`lists/${args.id}`, {
        params: { fields }
      });
    },
    card: (_parent, args, context, ast) => {
      const fields = getFields(ast)
        .filter(field => TRELLO_CARD_FIELDS.includes(field))
        .join(",");

      return context.request(encode`cards/${args.id}`, {
        params: { fields }
      });
    }
  },
  Member: {
    boards: (parent, args, context, ast) => {
      const fields = getFields(ast)
        .filter(field => TRELLO_BOARD_FIELDS.includes(field))
        .join(",");

      const filter = args.filter ? args.filter.join(",") : undefined;

      return context.request(encode`members/${parent.id}/boards`, {
        params: { filter, fields }
      });
    },
    cards: (parent, args, context, ast) => {
      const fields = getFields(ast)
        .filter(field => TRELLO_CARD_FIELDS.includes(field))
        .join(",");

      const filter = args.filter ? args.filter.join(",") : undefined;

      return context.request(encode`members/${parent.id}/cards`, {
        params: { filter, fields }
      });
    }
  },
  Board: {
    idOrganization: parent => parent.idOrganization || null
  }
};
