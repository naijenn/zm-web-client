<%@ tag body-content="empty" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>


<app:handleError>
<c:choose>
    <c:when test="${!empty param.actionCreate}">
        <c:set var="newFolderName" value="${fn:trim(param.newFolderName)}"/>
        <c:set var="newSearchQuery" value="${fn:trim(param.newSearchQuery)}"/>
        <c:choose>
            <c:when test="${empty newFolderName}">
                <app:status style="Warning">
                    <fmt:message key="actionNoAddressBookNameSpecified"/>
                </app:status>
            </c:when>
            <c:otherwise>
                <zm:createFolder parentid="1" var="folder" name="${newFolderName}" view="contact"/>
                <app:status>
                    <fmt:message key="actionAddressBookCreated">
                        <fmt:param value="${newFolderName}"/>
                    </fmt:message>
                </app:status>
            </c:otherwise>
        </c:choose>
    </c:when>
    <c:when test="${!empty param.actionRename}">
        <c:set var="newName" value="${fn:trim(param.newName)}"/>
        <c:choose>
            <c:when test="${empty newName}">
                <app:status style="Warning">
                    <fmt:message key="actionNoAddressBookNameSpecified"/>
                </app:status>
            </c:when>
            <c:when test="${!fn:startsWith(param.folderToRename, 'f:')}">
                <app:status style="Warning">
                    <fmt:message key="actionNoAddressBookRenameSelected"/>
                </app:status>
            </c:when>
            <c:otherwise>
                <c:set var="folderid" value="${fn:substring(param.folderToRename, 2, -1)}"/>
                <c:set var="oldName" value="${zm:getFolderName(pageContext, folderid)}"/>
                <zm:renameFolder id="${folderid}" newname="${newName}"/>
                <app:status>
                    <fmt:message key="actionAddressBookRenamed">
                        <fmt:param value="${oldName}"/>
                        <fmt:param value="${newName}"/>
                    </fmt:message>
                </app:status>
            </c:otherwise>
        </c:choose>
    </c:when>
    <c:when test="${!empty param.actionDelete}">
        <c:choose>
            <c:when test="${!fn:startsWith(param.folderToDelete, 'f:')}">
                <app:status style="Warning">
                    <fmt:message key="actionNoAddressBookDeleteSelected"/>
                </app:status>
            </c:when>
            <c:otherwise>
                <c:set var="folderid" value="${fn:substring(param.folderToDelete, 2, -1)}"/>
                <c:set var="folderName" value="${zm:getFolderName(pageContext, folderid)}"/>
                <zm:moveFolder id="${folderid}" parentid="3"/>
                <app:status>
                    <fmt:message key="actionAddressBookMovedToTrash">
                        <fmt:param value="${folderName}"/>
                    </fmt:message>
                </app:status>
            </c:otherwise>
        </c:choose>
    </c:when>
    <c:otherwise>

    </c:otherwise>
</c:choose>
</app:handleError>

