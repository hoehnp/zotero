describe("ZoteroPane", function() {
	var win, doc, zp;
	
	// Load Zotero pane and select library
	before(function* () {
		win = yield loadZoteroPane();
		doc = win.document;
		zp = win.ZoteroPane;
	});
	
	after(function () {
		win.close();
	});
	
	describe("#newItem", function () {
		it("should create an item and focus the title field", function* () {
			yield zp.newItem(Zotero.ItemTypes.getID('book'), {}, null, true);
			var itemBox = doc.getElementById('zotero-editpane-item-box');
			var textboxes = doc.getAnonymousNodes(itemBox)[0].getElementsByTagName('textbox');
			assert.lengthOf(textboxes, 1);
			assert.equal(textboxes[0].getAttribute('fieldname'), 'title');
			textboxes[0].blur();
			yield Zotero.Promise.delay(1);
		})
		
		it("should save an entered value when New Item is used", function* () {
			var value = "Test";
			var item = yield zp.newItem(Zotero.ItemTypes.getID('book'), {}, null, true);
			var itemBox = doc.getElementById('zotero-editpane-item-box');
			var textbox = doc.getAnonymousNodes(itemBox)[0].getElementsByTagName('textbox')[0];
			textbox.value = value;
			yield itemBox.blurOpenField();
			item = yield Zotero.Items.getAsync(item.id);
			assert.equal(item.getField('title'), value);
		})
	});
	
	describe("#newNote()", function () {
		it("should create a child note and select it", function* () {
			var item = yield createDataObject('item');
			var noteID = yield zp.newNote(false, item.key, "Test");
			var selected = zp.itemsView.getSelectedItems(true);
			assert.lengthOf(selected, 1);
			assert.equal(selected, noteID);
		})
	})
	
	describe("#itemSelected()", function () {
		it.skip("should update the item count", function* () {
			var collection = new Zotero.Collection;
			collection.name = "Count Test";
			var id = yield collection.saveTx();
			yield waitForItemsLoad(win);
			
			// Unselected, with no items in view
			assert.equal(
				doc.getElementById('zotero-item-pane-message').value,
				Zotero.getString('pane.item.unselected.zero', 0)
			);
			
			// Unselected, with one item in view
			var item = new Zotero.Item('newspaperArticle');
			item.setCollections([id]);
			var itemID1 = yield item.saveTx({
				skipSelect: true
			});
			assert.equal(
				doc.getElementById('zotero-item-pane-message').value,
				Zotero.getString('pane.item.unselected.singular', 1)
			);
			
			// Unselected, with multiple items in view
			var item = new Zotero.Item('audioRecording');
			item.setCollections([id]);
			var itemID2 = yield item.saveTx({
				skipSelect: true
			});
			assert.equal(
				doc.getElementById('zotero-item-pane-message').value,
				Zotero.getString('pane.item.unselected.plural', 2)
			);
			
			// Multiple items selected
			var promise = zp.itemsView._getItemSelectedPromise();
			zp.itemsView.rememberSelection([itemID1, itemID2]);
			yield promise;
			assert.equal(
				doc.getElementById('zotero-item-pane-message').value,
				Zotero.getString('pane.item.selected.multiple', 2)
			);
		})
	})
})
